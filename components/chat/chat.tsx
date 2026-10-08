"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/_ui/button";
import { Input } from "@/components/_ui/input";
import { ScrollArea } from "@/components/_ui/scroll-area";
import Tag from "@/components/_ui/tag";
import { cn } from "@/lib/utils";
import type { ChatChannel } from "@/data/chat";
import { useChatStore } from "@/stores/chat-store";
import { useSessionStore } from "@/stores/session-store";
import ChatIcon from "@/public/assets/images/nav/chat.svg";

export default function Chat() {
  const activeChannelId = useChatStore((state) => state.activeChannelId);
  const channels = useChatStore((state) => state.channels);
  const channel = channels.find((item) => item.id === activeChannelId);

  return (
    <section className="flex min-h-0 min-w-0 flex-1">
      <aside className="border-border flex w-60 shrink-0 flex-col border-r">
        <ChannelGroup title="Channels" kind="channel" />
        <ChannelGroup title="Trip threads" kind="trip" />
        <ChannelGroup title="Direct" kind="dm" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {channel ? (
          <>
            <ChannelHeader channel={channel} />
            <MessageList channelId={channel.id} />
            <Composer channelId={channel.id} />
          </>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="bg-muted flex size-12 items-center justify-center rounded-full shadow-[0px_0px_0px_1px_#232323]">
              <ChatIcon aria-hidden className="text-soft size-5" />
            </span>
            <span className="lead-style mt-2 block font-medium">Chat</span>
            <span className="caption-style text-subtle block max-w-64">
              Pick a channel, thread, or teammate on the left.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function ChannelGroup({ title, kind }: { title: string; kind: ChatChannel["kind"] }) {
  const activeChannelId = useChatStore((state) => state.activeChannelId);
  const setActiveChannel = useChatStore((state) => state.setActiveChannel);
  const unreadCount = useChatStore((state) => state.unreadCount);
  const allChannels = useChatStore((state) => state.channels);
  const channels = allChannels.filter((channel) => channel.kind === kind);

  if (channels.length === 0) return null;

  return (
    <div className="p-2">
      <p className="caption-style text-subtle px-2 pt-1 pb-2">{title}</p>
      {channels.map((channel) => {
        const unread = unreadCount(channel.id);
        return (
          <button
            key={channel.id}
            type="button"
            onClick={() => setActiveChannel(channel.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[14px] leading-none transition-colors duration-150 ease-power3-out",
              activeChannelId === channel.id
                ? "bg-accent text-foreground"
                : "text-soft hover:bg-muted hover:text-foreground",
            )}
          >
            <span className="text-subtle shrink-0" aria-hidden>
              {channel.kind === "dm" ? "@" : "#"}
            </span>
            <span className="min-w-0 flex-1 truncate">{channel.name}</span>
            {unread > 0 && (
              <span className="bg-primary text-primary-foreground caption-style flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full px-1">
                {unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ChannelHeader({ channel }: { channel: ChatChannel }) {
  return (
    <div className="border-border flex shrink-0 items-center gap-3 border-b px-4 py-3">
      <div className="min-w-0">
        <h2 className="truncate">
          {channel.kind === "dm" ? channel.name : `#${channel.name}`}
        </h2>
        {channel.topic && (
          <p className="caption-style text-subtle mt-1 truncate">
            {channel.topic}
          </p>
        )}
      </div>
      {channel.tripRef && (
        <Tag tone="blue" size="sm" className="ml-auto shrink-0">
          Trip {channel.tripRef}
        </Tag>
      )}
    </div>
  );
}

function MessageList({ channelId }: { channelId: string }) {
  const messages = useChatStore((state) => state.messages);
  const displayName = useSessionStore((state) => state.displayName);
  const endRef = useRef<HTMLDivElement>(null);
  const channelMessages = messages.filter((message) => message.channelId === channelId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [channelMessages.length, channelId]);

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-4 p-4">
        {channelMessages.map((message) => {
          const mine = message.author === displayName;
          return (
            <div key={message.id} className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "caption-style font-medium",
                    mine ? "text-primary" : "text-foreground",
                  )}
                >
                  {message.author}
                </span>
                <time className="caption-style text-subtle">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p className="text-soft max-w-[38em] text-[14px] leading-relaxed">
                {message.body}
              </p>
            </div>
          );
        })}
        {channelMessages.length === 0 && (
          <p className="caption-style text-subtle py-10 text-center">
            No messages yet — say hello.
          </p>
        )}
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}

function Composer({ channelId }: { channelId: string }) {
  const sendMessage = useChatStore((state) => state.sendMessage);
  const [body, setBody] = useState("");

  const send = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    sendMessage(channelId, trimmed);
    setBody("");
  };

  return (
    <form
      className="border-border flex shrink-0 items-center gap-2 border-t p-3"
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <Input
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Message…"
        aria-label="Message"
        autoComplete="off"
      />
      <Button variant="primary" size="md" type="submit" disabled={!body.trim()}>
        Send
      </Button>
    </form>
  );
}
