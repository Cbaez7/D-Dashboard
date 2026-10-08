import { create } from "zustand";
import type { Role } from "@/stores/app-store";

export type SessionData = {
  userId: string;
  email: string;
  displayName: string;
  initials: string;
  orgId: string;
  orgName: string;
  opsTz: string;
  myTz: string;
  leaveAllowanceDays: number;
  role: Role;
};

type SessionState = SessionData & {
  hydrated: boolean;
};

const EMPTY_SESSION: SessionState = {
  userId: "",
  email: "",
  displayName: "Dispatcher",
  initials: "—",
  orgId: "",
  orgName: "",
  opsTz: "America/Los_Angeles",
  myTz: "America/New_York",
  leaveAllowanceDays: 20,
  role: "dispatcher",
  hydrated: false,
};

export const useSessionStore = create<SessionState>(() => EMPTY_SESSION);
