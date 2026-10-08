import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CHANNELS, MESSAGES, type ChatChannel, type ChatMessage } from "@/data/chat";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { fetchChatData, insertMessage, markChannelRead } from "@/lib/db/chat";
import { useSessionStore } from "@/stores/session-store";

type ChatState = {
  hydrated: boolean;
  live: boolean;
  activeChannelId: string;
  channels: ChatChannel[];
  messages: ChatMessage[];
  lastRead: Record<string, string>;
  hydrate: () => Promise<void>;
  setActiveChannel: (channelId: string) => void;
  sendMessage: (channelId: string, body: string) => Promise<void>;
  markRead: (channelId: string) => void;
  unreadCount: (channelId: string) => number;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      live: false,
      activeChannelId: CHANNELS[0].id,
      channels: CHANNELS,
      messages: MESSAGES,
      lastRead: {},

      hydrate: async () => {
        if (get().hydrated) return;
        const { userId, orgId } = useSessionStore.getState();

        if (!SUPABASE_CONFIGURED || !userId || !orgId) {
          set({ hydrated: true, live: false });
          return;
        }

        try {
          const data = await fetchChatData(userId, orgId);
          set({
            hydrated: true,
            live: true,
            channels: data.channels,
            messages: data.messages,
            lastRead: data.lastRead,
            activeChannelId: get().channels.some(
              (channel) => channel.id === get().activeChannelId,
            )
              ? get().activeChannelId
              : (data.channels[0]?.id ?? ""),
          });

          const supabase = createClient();
          supabase
            .channel(`chat:${orgId}`)
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "messages",
                filter: `org_id=eq.${orgId}`,
              },
              async () => {
                const fresh = await fetchChatData(
                  useSessionStore.getState().userId,
                  orgId,
                );
                set({
                  channels: fresh.channels,
                  messages: fresh.messages,
                });
              },
            )
            .subscribe();
        } catch {
          set({ hydrated: true, live: false });
        }
      },

      setActiveChannel: (activeChannelId) => {
        set({ activeChannelId });
        get().markRead(activeChannelId);
      },

      sendMessage: async (channelId, body) => {
        const { userId, orgId, displayName } = useSessionStore.getState();

        if (!get().live || !userId || !orgId) {
          set((state) => ({
            messages: [
              ...state.messages,
              {
                id: `m-${Date.now()}`,
                channelId,
                author: displayName,
                body,
                createdAt: new Date().toISOString(),
              },
            ],
          }));
          return;
        }

        try {
          const row = await insertMessage({ orgId, channelId, userId, body });
          set((state) => ({
            messages: [
              ...state.messages,
              {
                id: String(row.id),
                channelId: row.channel_id,
                author: displayName,
                body: row.body,
                createdAt: row.created_at,
              },
            ],
          }));
          void markChannelRead(channelId, userId);
        } catch (error) {
          console.error("send failed", error);
        }
      },

      markRead: (channelId) => {
        const now = new Date().toISOString();
        set((state) => ({
          lastRead: { ...state.lastRead, [channelId]: now },
        }));
        const { userId } = useSessionStore.getState();
        if (get().live && userId) {
          void markChannelRead(channelId, userId);
        }
      },

      unreadCount: (channelId) => {
        const { messages, lastRead } = get();
        const since = lastRead[channelId] ?? "";
        const displayName = useSessionStore.getState().displayName;
        return messages.filter(
          (message) =>
            message.channelId === channelId &&
            message.createdAt > since &&
            message.author !== displayName,
        ).length;
      },
    }),
    {
      name: "bng-chat",
      version: 2,
      migrate: (persisted) =>
        ({ activeChannelId: (persisted as { activeChannelId?: string })?.activeChannelId }) as ChatState,
      partialize: (state) => ({ activeChannelId: state.activeChannelId }),
    },
  ),
);
