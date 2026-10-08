"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import { useClockStore } from "@/stores/clock-store";
import { useSessionStore, type SessionData } from "@/stores/session-store";

export default function SessionSync({ session }: { session: SessionData | null }) {
  useEffect(() => {
    useSessionStore.setState({ hydrated: true });
    if (!session) {
      void useClockStore.getState().hydrate();
      return;
    }
    useSessionStore.setState({ ...session, hydrated: true });
    useAppStore.setState({ role: session.role });
    void useClockStore.getState().hydrate();
  }, [session]);
  return null;
}
