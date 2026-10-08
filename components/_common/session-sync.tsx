"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import { useClockStore } from "@/stores/clock-store";
import { useChatStore } from "@/stores/chat-store";
import { useGuideStore } from "@/stores/guide-store";
import { useTasksStore } from "@/stores/tasks-store";
import { useSessionStore, type SessionData } from "@/stores/session-store";

function hydrateStores() {
  void useClockStore.getState().hydrate();
  void useChatStore.getState().hydrate();
  void useGuideStore.getState().hydrate();
  void useTasksStore.getState().hydrate();
}

export default function SessionSync({ session }: { session: SessionData | null }) {
  useEffect(() => {
    useSessionStore.setState({ hydrated: true });
    if (session) {
      useSessionStore.setState({ ...session, hydrated: true });
      useAppStore.setState({ role: session.role });
    }
    hydrateStores();
  }, [session]);
  return null;
}
