import { create } from "zustand";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import {
  fetchQuotes,
  insertQuote,
  updateQuoteStatus,
  type QuoteStatus,
  type SavedQuote,
} from "@/lib/db/quotes";
import type { QuoteInput, QuoteResult } from "@/lib/quote/engine";
import type { QuoteRoute } from "@/lib/db/quotes";
import { useSessionStore } from "@/stores/session-store";

type QuoteState = {
  hydrated: boolean;
  live: boolean;
  history: SavedQuote[];
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  save: (
    input: QuoteInput,
    result: QuoteResult,
    route: QuoteRoute,
    customer: { name: string; email: string; phone: string },
  ) => Promise<boolean>;
  setStatus: (id: string, status: QuoteStatus) => void;
};

export const useQuoteStore = create<QuoteState>()((set, get) => ({
  hydrated: false,
  live: false,
  history: [],

  hydrate: async () => {
    if (get().hydrated) return;
    const { orgId } = useSessionStore.getState();

    if (!SUPABASE_CONFIGURED || !orgId) {
      set({ hydrated: true, live: false });
      return;
    }

    try {
      set({ hydrated: true, live: true, history: await fetchQuotes(orgId) });

      const supabase = createClient();
      supabase
        .channel(`quotes:${orgId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "quotes",
            filter: `org_id=eq.${orgId}`,
          },
          async () => {
            const currentOrg = useSessionStore.getState().orgId;
            if (currentOrg) {
              set({ history: await fetchQuotes(currentOrg) });
            }
          },
        )
        .subscribe();
    } catch {
      set({ hydrated: true, live: false });
    }
  },

  refresh: async () => {
    const { orgId } = useSessionStore.getState();
    if (!get().live || !orgId) return;
    try {
      set({ history: await fetchQuotes(orgId) });
    } catch (error) {
      console.error("quote refresh failed", error);
    }
  },

  save: async (input, result, route, customer) => {
    const { orgId, userId } = useSessionStore.getState();
    if (!get().live || !orgId || !userId) return false;
    try {
      await insertQuote({
        orgId,
        userId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        input,
        result,
        route,
      });
      await get().refresh();
      return true;
    } catch (error) {
      console.error("quote save failed", error);
      return false;
    }
  },

  setStatus: (id, status) => {
    set((state) => ({
      history: state.history.map((quote) =>
        quote.id === id
          ? {
              ...quote,
              status,
              emailedAt:
                status === "sent"
                  ? new Date().toISOString()
                  : quote.emailedAt,
            }
          : quote,
      ),
    }));
    const { orgId } = useSessionStore.getState();
    if (get().live && orgId) {
      updateQuoteStatus(orgId, id, status).catch((error) => {
        console.error("quote status failed", error);
        void get().refresh();
      });
    }
  },
}));
