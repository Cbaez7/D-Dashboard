import { create } from "zustand";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import {
  fetchAuditEvents,
  fetchIntegrationStates,
  fetchMembers,
  fetchVehicles,
  updateMemberRole,
  updateVehicleStatus,
  type AuditEvent,
  type IntegrationState,
  type Member,
  type Vehicle,
} from "@/lib/db/admin";
import { useSessionStore } from "@/stores/session-store";

const MOCK_MEMBERS: Member[] = [
  { id: "mock-chris", name: "Chris Baez", role: "admin" },
  { id: "mock-maria", name: "Maria Santos", role: "dispatcher" },
  { id: "mock-devon", name: "Devon Cole", role: "dispatcher" },
  { id: "mock-priya", name: "Priya Nair", role: "dispatcher" },
];

const MOCK_ACTIVITY: AuditEvent[] = [
  {
    id: 1,
    actor: "Maria Santos",
    action: "Edited SOP “Airport pickup procedure” → v5",
    entity: "sop_page",
    entityId: null,
    createdAt: "2026-10-08T12:15:00Z",
  },
  {
    id: 2,
    actor: "Devon Cole",
    action: "Completed task #1038 – Stage vehicle 12",
    entity: "task",
    entityId: null,
    createdAt: "2026-10-08T11:40:00Z",
  },
  {
    id: 3,
    actor: "Chris Baez",
    action: "Linked email thread to trip #4471",
    entity: "email",
    entityId: null,
    createdAt: "2026-10-08T10:05:00Z",
  },
];

const MOCK_VEHICLES: Vehicle[] = [
  { id: "mock-08", name: "Vehicle 08", plate: "8BNK120", type: "Sedan", status: "active" },
  { id: "mock-12", name: "Vehicle 12", plate: "8BNK330", type: "SUV", status: "active" },
  { id: "mock-15", name: "Vehicle 15", plate: "8BNK415", type: "Sprinter", status: "maintenance" },
];

type AdminState = {
  hydrated: boolean;
  live: boolean;
  members: Member[];
  integrations: IntegrationState[];
  activity: AuditEvent[];
  vehicles: Vehicle[];
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  setMemberRole: (userId: string, role: Member["role"]) => void;
  setVehicleStatus: (id: string, status: Vehicle["status"]) => void;
};

async function loadAll() {
  const [members, integrations, activity, vehicles] = await Promise.all([
    fetchMembers(),
    fetchIntegrationStates(),
    fetchAuditEvents(),
    fetchVehicles(),
  ]);
  return { members, integrations, activity, vehicles };
}

export const useAdminStore = create<AdminState>()((set, get) => ({
  hydrated: false,
  live: false,
  members: MOCK_MEMBERS,
  integrations: [],
  activity: MOCK_ACTIVITY,
  vehicles: MOCK_VEHICLES,

  hydrate: async () => {
    if (get().hydrated) return;
    const { orgId } = useSessionStore.getState();

    if (!SUPABASE_CONFIGURED || !orgId) {
      set({ hydrated: true, live: false });
      return;
    }

    try {
      set({ hydrated: true, live: true, ...(await loadAll()) });

      const supabase = createClient();
      const reload = async () => {
        try {
          set(await loadAll());
        } catch (error) {
          console.error("admin refresh failed", error);
        }
      };
      supabase
        .channel(`admin:${orgId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "org_members" },
          reload,
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "audit_events" },
          reload,
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "vehicles" },
          reload,
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "integration_state" },
          reload,
        )
        .subscribe();
    } catch {
      set({ hydrated: true, live: false });
    }
  },

  refresh: async () => {
    if (!get().live) return;
    try {
      set(await loadAll());
    } catch (error) {
      console.error("admin refresh failed", error);
    }
  },

  setMemberRole: (userId, role) => {
    set((state) => ({
      members: state.members.map((member) =>
        member.id === userId ? { ...member, role } : member,
      ),
    }));
    const { orgId } = useSessionStore.getState();
    if (get().live && orgId) {
      updateMemberRole(orgId, userId, role).catch((error) => {
        console.error("role update failed", error);
        void get().refresh();
      });
    }
  },

  setVehicleStatus: (id, status) => {
    set((state) => ({
      vehicles: state.vehicles.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, status } : vehicle,
      ),
    }));
    const { orgId } = useSessionStore.getState();
    if (get().live && orgId) {
      updateVehicleStatus(orgId, id, status).catch((error) => {
        console.error("vehicle update failed", error);
        void get().refresh();
      });
    }
  },
}));
