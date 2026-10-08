"use client";

import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import Tag from "@/components/_ui/tag";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import ClockPanel from "@/components/clock/clock-panel";
import type { Task } from "@/data/tasks";
import { useAppStore, type SurfaceId } from "@/stores/app-store";
import { useChatStore } from "@/stores/chat-store";
import { useGuideStore } from "@/stores/guide-store";
import { useTasksStore } from "@/stores/tasks-store";
import { useSessionStore } from "@/stores/session-store";

const PRIORITY_TONE: Record<Task["priority"], "neutral" | "blue" | "orange" | "red"> = {
  low: "neutral",
  normal: "blue",
  high: "orange",
  urgent: "red",
};

const STATUS_LABEL: Record<Task["status"], string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
  closed: "Closed",
};

export default function Dispatch() {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4">
          <AttentionStrip />
          <ClockPanel />
          <MyTasks />
          <TripsToday />
        </div>
      </ScrollArea>
    </section>
  );
}

function AttentionStrip() {
  const setActiveSurface = useAppStore((state) => state.setActiveSurface);
  const pages = useGuideStore((state) => state.pages);
  const acknowledgments = useGuideStore((state) => state.acknowledgments);
  const tasks = useTasksStore((state) => state.tasks);
  const messages = useChatStore((state) => state.messages);
  const lastRead = useChatStore((state) => state.lastRead);
  const displayName = useSessionStore((state) => state.displayName);
  const channels = useChatStore((state) => state.channels);

  const pendingSops = pages.filter(
    (page) => page.requiresAck && acknowledgments[page.id] !== page.version,
  ).length;
  const openTasks = tasks.filter(
    (task) =>
      task.assignee === displayName &&
      (task.status === "open" || task.status === "in_progress"),
  ).length;
  const unreadChats = channels.reduce(
    (total, channel) =>
      total +
      messages.filter(
        (message) =>
          message.channelId === channel.id &&
          message.createdAt > (lastRead[channel.id] ?? "") &&
          message.author !== displayName,
      ).length,
    0,
  );
  const pendingLeave = 0;

  const cards: { label: string; count: number; surface: SurfaceId }[] = [
    { label: "SOPs to acknowledge", count: pendingSops, surface: "guide" },
    { label: "Tasks in flight", count: openTasks, surface: "dispatch" },
    { label: "Unread chats", count: unreadChats, surface: "chat" },
    { label: "Leave pending", count: pendingLeave, surface: "clock" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.label}
          type="button"
          onClick={() => setActiveSurface(card.surface)}
          className="border-border bg-card hover:border-line-strong group rounded-xl border px-4 py-3 text-left transition-colors duration-150 ease-power3-out"
        >
          <p className="caption-style text-subtle mb-1.5">{card.label}</p>
          <p className="flex items-center justify-between">
            <span
              className={
                card.count > 0
                  ? "text-[20px] leading-none font-medium text-foreground"
                  : "text-[20px] leading-none font-medium text-faint"
              }
            >
              {card.count}
            </span>
            <span
              aria-hidden
              className="text-subtle transition-transform duration-150 ease-power3-out group-hover:translate-x-0.5"
            >
              →
            </span>
          </p>
        </button>
      ))}
    </div>
  );
}

function MyTasks() {
  const tasks = useTasksStore((state) => state.tasks);
  const setStatus = useTasksStore((state) => state.setStatus);
  const displayName = useSessionStore((state) => state.displayName);
  const mine = tasks.filter(
    (task) =>
      task.assignee === displayName &&
      task.status !== "done" &&
      task.status !== "closed",
  );

  return (
    <div className="flex flex-col gap-3">
      <h2>My tasks</h2>
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        {mine.length === 0 ? (
          <p className="caption-style text-subtle px-4 py-10 text-center">
            Nothing assigned — enjoy the quiet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mine.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="text-subtle">#{task.ref}</TableCell>
                  <TableCell className="max-w-64">
                    <span className="block truncate">{task.title}</span>
                    {task.tripRef && (
                      <span className="caption-style text-subtle mt-1 block">
                        Trip {task.tripRef}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tag tone={PRIORITY_TONE[task.priority]} size="sm">
                      {task.priority}
                    </Tag>
                  </TableCell>
                  <TableCell className="text-soft">
                    {task.dueAt
                      ? new Date(task.dueAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={task.status}
                      onValueChange={(value) =>
                        setStatus(task.id, value as Task["status"])
                      }
                    >
                      <SelectTrigger
                        className="ml-auto h-7 w-32"
                        aria-label={`Status for task ${task.ref}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.entries(STATUS_LABEL) as [
                            Task["status"],
                            string,
                          ][]
                        ).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function TripsToday() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2>Trips today</h2>
        <Tag tone="neutral" size="sm">
          LimoAnywhere feed pending
        </Tag>
      </div>
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pickup</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Passenger</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>22:15</TableCell>
              <TableCell>LAX → Beverly Hills</TableCell>
              <TableCell className="text-soft">N. Ellison +1</TableCell>
              <TableCell className="text-soft">Devon Cole</TableCell>
              <TableCell className="text-right">
                <Tag tone="green" size="sm">
                  Confirmed
                </Tag>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>23:40</TableCell>
              <TableCell>Beverly Hills → LAX</TableCell>
              <TableCell className="text-soft">N. Ellison +1</TableCell>
              <TableCell className="text-soft">Devon Cole</TableCell>
              <TableCell className="text-right">
                <Tag tone="blue" size="sm">
                  Scheduled
                </Tag>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
