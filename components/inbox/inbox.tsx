"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import Tag from "@/components/_ui/tag";
import { cn } from "@/lib/utils";
import { MAIL_THREADS } from "@/data/inbox";
import InboxIcon from "@/public/assets/images/nav/inbox.svg";

const FOLDERS = [
  { id: "inbox", label: "Inbox" },
  { id: "sent", label: "Sent" },
  { id: "linked", label: "Linked to trips" },
];

const KNOWN_TRIPS = ["#4471", "#4475", "#4479"];

export default function Inbox() {
  const [folder, setFolder] = useState("inbox");
  const [threads, setThreads] = useState(MAIL_THREADS);
  const [selectedId, setSelectedId] = useState(threads[0]?.id ?? "");

  const visible = threads.filter((thread) =>
    folder === "linked" ? thread.linkedTrip !== null : folder === "inbox",
  );
  const selected = threads.find((thread) => thread.id === selectedId);

  const open = (id: string) => {
    setSelectedId(id);
    setThreads((list) =>
      list.map((thread) =>
        thread.id === id ? { ...thread, unread: false } : thread,
      ),
    );
  };

  const linkTrip = (id: string, trip: string) =>
    setThreads((list) =>
      list.map((thread) =>
        thread.id === id ? { ...thread, linkedTrip: trip || null } : thread,
      ),
    );

  return (
    <section className="flex min-h-0 min-w-0 flex-1">
      <aside className="border-border flex w-44 shrink-0 flex-col border-r p-2">
        {FOLDERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFolder(item.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[14px] leading-none transition-colors duration-150 ease-power3-out",
              folder === item.id
                ? "bg-accent text-foreground"
                : "text-soft hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
            {item.id === "inbox" && threads.some((t) => t.unread) && (
              <span
                aria-label="Unread mail"
                className="bg-primary ml-auto size-1.5 rounded-full"
              />
            )}
          </button>
        ))}
        <p className="caption-style text-subtle mt-auto px-2 pt-4 pb-2">
          Shared mailbox via Microsoft 365 – sync pending credentials.
        </p>
      </aside>

      <div className="border-border flex w-72 shrink-0 flex-col border-r">
        <ScrollArea className="min-h-0 flex-1">
          <div className="divide-border flex flex-col divide-y">
            {visible.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => open(thread.id)}
                className={cn(
                  "flex flex-col gap-1 px-3 py-3 text-left transition-colors duration-150 ease-power3-out",
                  selected?.id === thread.id
                    ? "bg-accent"
                    : "hover:bg-muted/60",
                )}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[14px] leading-none",
                      thread.unread ? "font-medium" : "text-soft",
                    )}
                  >
                    {thread.from}
                  </span>
                  <time className="caption-style text-subtle shrink-0">
                    {new Date(thread.receivedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
                <span
                  className={cn(
                    "truncate text-[14px] leading-none",
                    thread.unread ? "text-foreground" : "text-soft",
                  )}
                >
                  {thread.subject}
                </span>
                <span className="caption-style text-subtle truncate">
                  {thread.preview}
                </span>
                {thread.linkedTrip && (
                  <Tag tone="blue" size="sm" className="mt-1 self-start">
                    Trip {thread.linkedTrip}
                  </Tag>
                )}
              </button>
            ))}
            {visible.length === 0 && (
              <p className="caption-style text-subtle px-3 py-10 text-center">
                Nothing here.
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            <div className="border-border flex shrink-0 items-center gap-3 border-b px-4 py-3">
              <div className="min-w-0 flex-1">
                <h2 className="truncate">{selected.subject}</h2>
                <p className="caption-style text-subtle mt-1 truncate">
                  {selected.from} &lt;{selected.fromAddress}&gt; ·{" "}
                  {new Date(selected.receivedAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Select
                  value={selected.linkedTrip ?? ""}
                  onValueChange={(value) => linkTrip(selected.id, value)}
                >
                  <SelectTrigger
                    className="h-8 w-36"
                    aria-label="Link email to trip"
                  >
                    <SelectValue placeholder="Link to trip" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No trip</SelectItem>
                    {KNOWN_TRIPS.map((trip) => (
                      <SelectItem key={trip} value={trip}>
                        Trip {trip}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="secondary" size="md">
                  Reply
                </Button>
              </div>
            </div>
            <ScrollArea className="min-h-0 flex-1">
              <div className="mx-auto w-full max-w-2xl px-4 py-6">
                <p className="text-soft text-[14px] leading-relaxed whitespace-pre-wrap">
                  {selected.body}
                </p>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="bg-muted flex size-12 items-center justify-center rounded-full shadow-[0px_0px_0px_1px_var(--ring-soft)]">
              <InboxIcon aria-hidden className="text-soft size-5" />
            </span>
            <span className="lead-style mt-2 block font-medium">Inbox</span>
            <span className="caption-style text-subtle block max-w-64">
              Pick a thread to read it.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
