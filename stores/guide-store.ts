import { create } from "zustand";
import { SOP_PAGES, type SopPage } from "@/data/guide";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";
import {
  acknowledgePage,
  fetchGuideData,
  saveSopPage,
} from "@/lib/db/guide";
import { useSessionStore } from "@/stores/session-store";

type GuideState = {
  hydrated: boolean;
  live: boolean;
  pages: SopPage[];
  acknowledgments: Record<string, number>;
  hydrate: () => Promise<void>;
  acknowledge: (pageId: string, version: number) => void;
  savePage: (page: SopPage) => Promise<void>;
};

export const useGuideStore = create<GuideState>()((set, get) => ({
  hydrated: false,
  live: false,
  pages: SOP_PAGES,
  acknowledgments: {},

  hydrate: async () => {
    if (get().hydrated) return;
    const { userId, orgId } = useSessionStore.getState();

    if (!SUPABASE_CONFIGURED || !userId || !orgId) {
      set({ hydrated: true, live: false });
      return;
    }

    try {
      const data = await fetchGuideData(userId);
      set({
        hydrated: true,
        live: true,
        pages: data.pages,
        acknowledgments: data.acknowledgments,
      });
    } catch {
      set({ hydrated: true, live: false });
    }
  },

  acknowledge: (pageId, version) => {
    set((state) => ({
      acknowledgments: { ...state.acknowledgments, [pageId]: version },
    }));
    const { userId } = useSessionStore.getState();
    if (get().live && userId) {
      void acknowledgePage(pageId, userId, version).catch((error) =>
        console.error("acknowledge failed", error),
      );
    }
  },

  savePage: async (page) => {
    const nextVersion = page.version + 1;
    const apply = () =>
      set((state) => ({
        pages: state.pages.map((existing) =>
          existing.id === page.id
            ? { ...page, version: nextVersion, updatedAt: new Date().toISOString() }
            : existing,
        ),
      }));

    const { userId } = useSessionStore.getState();
    if (!get().live || !userId) {
      apply();
      return;
    }

    try {
      await saveSopPage({ page, userId });
      apply();
    } catch (error) {
      console.error("save page failed", error);
    }
  },
}));
