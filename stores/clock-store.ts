import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CLOCK_ENTRIES,
  LEAVE_REQUESTS,
  OPS_TZ,
  type ClockEntry,
  type LeaveRequest,
} from "@/data/clock";

type ClockState = {
  checkedInAt: string | null;
  entries: ClockEntry[];
  leaveRequests: LeaveRequest[];
  checkIn: () => void;
  checkOut: () => void;
  requestLeave: (request: Omit<LeaveRequest, "id" | "status">) => void;
};

export const useClockStore = create<ClockState>()(
  persist(
    (set) => ({
      checkedInAt: null,
      entries: CLOCK_ENTRIES,
      leaveRequests: LEAVE_REQUESTS,
      checkIn: () =>
        set((state) => {
          const now = new Date().toISOString();
          const entry: ClockEntry = {
            id: `ce-${now}`,
            opsDate: now.slice(0, 10),
            shiftLabel: "14:30 – 22:30",
            clockInAt: now,
            clockOutAt: null,
            tz: OPS_TZ,
            location: OPS_TZ,
          };
          return { checkedInAt: now, entries: [entry, ...state.entries] };
        }),
      checkOut: () =>
        set((state) => ({
          checkedInAt: null,
          entries: state.entries.map((entry) =>
            entry.clockInAt === state.checkedInAt && entry.clockOutAt === null
              ? { ...entry, clockOutAt: new Date().toISOString() }
              : entry,
          ),
        })),
      requestLeave: (request) =>
        set((state) => ({
          leaveRequests: [
            { ...request, id: `lr-${Date.now()}`, status: "pending" },
            ...state.leaveRequests,
          ],
        })),
    }),
    { name: "bng-clock" },
  ),
);
