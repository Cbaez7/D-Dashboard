import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CHANNELS, MESSAGES, type ChatMessage } from "@/data/chat";
import { CURRENT_USER } from "@/data/session";

type ChatState = {
  activeChannelId: string;
  messages: ChatMessage[];
  lastRead: Record<string, string>;
  setActiveChannel: (channelId: string) => void;
  sendMessage: (channelId: string, body: string) => void;
  markRead: (channelId: string) => void;
  unreadCount: (channelId: string) => number;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      activeChannelId: CHANNELS[0].id,
      messages: MESSAGES,
      lastRead: {},
      setActiveChannel: (activeChannelId) => {
        set({ activeChannelId });
        get().markRead(activeChannelId);
      },
      sendMessage: (channelId, body) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: `m-${Date.now()}`,
              channelId,
              author: CURRENT_USER.name,
              body,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      markRead: (channelId) =>
        set((state) => ({
          lastRead: {
            ...state.lastRead,
            [channelId]: new Date().toISOString(),
          },
        })),
      unreadCount: (channelId) => {
        const { messages, lastRead } = get();
        const since = lastRead[channelId] ?? "";
        return messages.filter(
          (message) =>
            message.channelId === channelId &&
            message.createdAt > since &&
            message.author !== CURRENT_USER.name,
        ).length;
      },
    }),
    { name: "bng-chat" },
  ),
);
