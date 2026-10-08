import { create } from "zustand";
import {
  CLOCK_ENTRIES,
  LEAVE_REQUESTS,
  OPS_TZ,
  TODAYS_SHIFT,
  type ClockEntry,
  type LeaveRequest,
  type Shift,
} from "@/data/clock";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import {
  fetchClockSnapshot,
  insertClockIn,
  insertLeaveRequest,
  updateClockOut,
} from "@/lib/db/clock";
import { useSessionStore } from "@/stores/session-store";

type ClockState = {
  hydrated: boolean;
  live: boolean;
  shift: Shift | null;
  checkedInAt: string | null;
  openEntryId: string | null;
  entries: ClockEntry[];
  leaveRequests: LeaveRequest[];
  hydrate: () => Promise<void>;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  requestLeave: (
    request: Omit<LeaveRequest, "id" | "status">,
  ) => Promise<void>;
};

export const useClockStore = create<ClockState>()((set, get) => ({
  hydrated: false,
  live: false,
  shift: null,
  checkedInAt: null,
  openEntryId: null,
  entries: [],
  leaveRequests: [],

  hydrate: async () => {
    if (get().hydrated) return;
    const { userId, opsTz } = useSessionStore.getState();

    if (!SUPABASE_CONFIGURED || !userId) {
      set({
        hydrated: true,
        live: false,
        shift: TODAYS_SHIFT,
        entries: CLOCK_ENTRIES,
        leaveRequests: LEAVE_REQUESTS,
      });
      return;
    }

    try {
      const snapshot = await fetchClockSnapshot(userId, opsTz);
      set({
        hydrated: true,
        live: true,
        shift: snapshot.shift,
        entries: snapshot.entries,
        leaveRequests: snapshot.leaveRequests,
        openEntryId: snapshot.openEntry?.id ?? null,
        checkedInAt: snapshot.openEntry?.clockInAt ?? null,
      });

      const supabase = createClient();
      supabase
        .channel(`clock:${userId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "clock_entries", filter: `user_id=eq.${userId}` },
          async () => {
            const fresh = await fetchClockSnapshot(userId, useSessionStore.getState().opsTz);
            set({
              shift: fresh.shift,
              entries: fresh.entries,
              leaveRequests: fresh.leaveRequests,
              openEntryId: fresh.openEntry?.id ?? null,
              checkedInAt: fresh.openEntry?.clockInAt ?? null,
            });
          },
        )
        .subscribe();
    } catch {
      set({
        hydrated: true,
        live: false,
        shift: TODAYS_SHIFT,
        entries: CLOCK_ENTRIES,
        leaveRequests: LEAVE_REQUESTS,
      });
    }
  },

  checkIn: async () => {
    const state = get();
    if (state.checkedInAt) return;
    const { userId, orgId, opsTz } = useSessionStore.getState();

    if (!state.live || !userId || !orgId) {
      const now = new Date().toISOString();
      set({
        checkedInAt: now,
        openEntryId: `ce-${now}`,
        entries: [
          {
            id: `ce-${now}`,
            opsDate: now.slice(0, 10),
            shiftLabel: state.shift
              ? `${state.shift.startTime} – ${state.shift.endTime}`
              : "Unscheduled",
            clockInAt: now,
            clockOutAt: null,
            tz: OPS_TZ,
            location: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          ...state.entries,
        ],
      });
      return;
    }

    try {
      const entry = await insertClockIn({
        orgId,
        userId,
        shiftId: state.shift?.id ?? null,
        opsTz,
      });
      set({
        checkedInAt: entry.clockInAt,
        openEntryId: entry.id,
        entries: [entry, ...state.entries],
      });
    } catch (error) {
      console.error("check-in failed", error);
    }
  },

  checkOut: async () => {
    const state = get();
    if (!state.openEntryId || !state.checkedInAt) return;
    const outAt = new Date().toISOString();

    if (state.live) {
      try {
        await updateClockOut(state.openEntryId);
      } catch (error) {
        console.error("check-out failed", error);
        return;
      }
    }

    set({
      checkedInAt: null,
      openEntryId: null,
      entries: state.entries.map((entry) =>
        entry.id === state.openEntryId
          ? { ...entry, clockOutAt: outAt }
          : entry,
      ),
    });
  },

  requestLeave: async (request) => {
    const { userId, orgId } = useSessionStore.getState();

    if (!get().live || !userId || !orgId) {
      set((state) => ({
        leaveRequests: [
          { ...request, id: `lr-${Date.now()}`, status: "pending" },
          ...state.leaveRequests,
        ],
      }));
      return;
    }

    try {
      const row = await insertLeaveRequest({ ...request, orgId, userId });
      set((state) => ({ leaveRequests: [row, ...state.leaveRequests] }));
    } catch (error) {
      console.error("leave request failed", error);
    }
  },
}));
