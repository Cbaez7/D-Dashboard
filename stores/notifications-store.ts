import { create } from "zustand";
import { NOTIFICATIONS, type Notification } from "@/data/notifications";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import {
  fetchNotifications,
  mapNotification,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationRow,
} from "@/lib/db/notifications";
import { playDing } from "@/lib/notify-sound";
import { useSessionStore } from "@/stores/session-store";
import { useToastStore } from "@/stores/toast-store";

type NotificationsState = {
  hydrated: boolean;
  live: boolean;
  items: Notification[];
  hydrate: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  hydrated: false,
  live: false,
  items: NOTIFICATIONS,

  hydrate: async () => {
    if (get().hydrated) return;
    const { userId } = useSessionStore.getState();

    if (!SUPABASE_CONFIGURED || !userId) {
      set({ hydrated: true, live: false });
      return;
    }

    try {
      set({ hydrated: true, live: true, items: await fetchNotifications(userId) });

      const supabase = createClient();
      supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          async (payload) => {
            if (payload.eventType === "INSERT") {
              const notification = mapNotification(
                payload.new as NotificationRow,
              );
              set((state) => ({
                items: [
                  notification,
                  ...state.items.filter((item) => item.id !== notification.id),
                ],
              }));
              useToastStore.getState().push({
                kind: notification.kind,
                title: notification.message,
                body: notification.quote,
                surface: notification.surface,
                notificationId: notification.id,
              });
              playDing();
              return;
            }
            set({
              items: await fetchNotifications(
                useSessionStore.getState().userId,
              ),
            });
          },
        )
        .subscribe();
    } catch {
      set({ hydrated: true, live: false });
    }
  },

  markRead: (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, unread: false } : item,
      ),
    }));
    if (get().live) {
      void markNotificationRead(id).catch((error) =>
        console.error("mark read failed", error),
      );
    }
  },

  markAllRead: () => {
    set((state) => ({
      items: state.items.map((item) => ({ ...item, unread: false })),
    }));
    const { userId } = useSessionStore.getState();
    if (get().live && userId) {
      void markAllNotificationsRead(userId).catch((error) =>
        console.error("mark all read failed", error),
      );
    }
  },
}));
