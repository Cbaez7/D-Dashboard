import { create } from "zustand";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import {
  fetchAccounts,
  fetchClientDetail,
  fetchClients,
  insertClient,
  insertClientNote,
  updateClient,
  upsertAccount,
  type Account,
  type Client,
  type ClientDetail,
  type ClientInput,
} from "@/lib/db/clients";
import { useSessionStore } from "@/stores/session-store";

type ClientsState = {
  hydrated: boolean;
  live: boolean;
  clients: Client[];
  accounts: Account[];
  detail: ClientDetail | null;
  detailLoading: boolean;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  openDetail: (client: Client) => Promise<void>;
  closeDetail: () => void;
  addClient: (input: Omit<ClientInput, "orgId">) => Promise<Client | null>;
  saveClient: (id: string, patch: Partial<ClientInput>) => Promise<boolean>;
  addNote: (clientId: string, body: string) => Promise<boolean>;
  saveAccount: (account: { id?: string; name: string; notes: string; billingEmail?: string }) => Promise<boolean>;
};

export const useClientsStore = create<ClientsState>()((set, get) => ({
  hydrated: false,
  live: false,
  clients: [],
  accounts: [],
  detail: null,
  detailLoading: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const { orgId } = useSessionStore.getState();

    if (!SUPABASE_CONFIGURED || !orgId) {
      set({ hydrated: true, live: false });
      return;
    }

    try {
      const [clients, accounts] = await Promise.all([
        fetchClients(orgId),
        fetchAccounts(orgId),
      ]);
      set({ hydrated: true, live: true, clients, accounts });

      const supabase = createClient();
      supabase
        .channel(`clients:${orgId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "clients" },
          () => void get().refresh(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "accounts" },
          () => void get().refresh(),
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
      const [clients, accounts] = await Promise.all([
        fetchClients(orgId),
        fetchAccounts(orgId),
      ]);
      set({ clients, accounts });
      const detail = get().detail;
      if (detail) {
        const fresh = clients.find((c) => c.id === detail.client.id);
        if (fresh) {
          set({
            detail: await fetchClientDetail(fresh.id, fresh.email),
          });
        }
      }
    } catch (error) {
      console.error("clients refresh failed", error);
    }
  },

  openDetail: async (client) => {
    set({ detailLoading: true });
    try {
      const detail = await fetchClientDetail(client.id, client.email);
      set({ detail, detailLoading: false });
    } catch (error) {
      console.error("client detail failed", error);
      set({
        detail: { client, addresses: [], notes: [], quotes: [] },
        detailLoading: false,
      });
    }
  },

  closeDetail: () => set({ detail: null }),

  addClient: async (input) => {
    const { orgId } = useSessionStore.getState();
    if (!get().live || !orgId) return null;
    try {
      const client = await insertClient({ ...input, orgId });
      set((state) => ({
        clients: [...state.clients, client].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      }));
      return client;
    } catch (error) {
      console.error("client insert failed", error);
      return null;
    }
  },

  saveClient: async (id, patch) => {
    const { orgId } = useSessionStore.getState();
    if (!get().live || !orgId) return false;
    try {
      await updateClient(id, orgId, patch);
      await get().refresh();
      return true;
    } catch (error) {
      console.error("client update failed", error);
      return false;
    }
  },

  addNote: async (clientId, body) => {
    const { orgId, userId } = useSessionStore.getState();
    if (!get().live || !orgId || !userId || !body.trim()) return false;
    try {
      await insertClientNote(orgId, clientId, userId, body.trim());
      const detail = get().detail;
      if (detail && detail.client.id === clientId) {
        set({ detail: await fetchClientDetail(clientId, detail.client.email) });
      }
      return true;
    } catch (error) {
      console.error("note insert failed", error);
      return false;
    }
  },

  saveAccount: async (account) => {
    const { orgId } = useSessionStore.getState();
    if (!get().live || !orgId) return false;
    try {
      await upsertAccount(orgId, account);
      await get().refresh();
      return true;
    } catch (error) {
      console.error("account save failed", error);
      return false;
    }
  },
}));
