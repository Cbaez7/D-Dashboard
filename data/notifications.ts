import type { SurfaceId } from "@/stores/app-store";

export type NotificationKind = "call" | "trip" | "mention" | "task" | "system";

export function formatRelativeTime(iso: string) {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return iso;
  const seconds = Math.max(0, (Date.now() - time) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export type Notification = {
  id: string;
  kind: NotificationKind;
  actor?: string;
  surface?: SurfaceId;
  message: string;
  quote?: string;
  time: string;
  unread: boolean;
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    kind: "call",
    surface: "calls",
    message: "Missed call from +1 (310) 555-0182",
    time: "4m ago",
    unread: true,
  },
  {
    id: "n2",
    kind: "trip",
    surface: "dispatch",
    message: "Trip #1042 updated in LimoAnywhere",
    time: "12m ago",
    unread: true,
  },
  {
    id: "n3",
    kind: "mention",
    actor: "Marta",
    surface: "chat",
    message: "mentioned you in #dispatch",
    quote: "Can someone cover the LAX pickup at 6am?",
    time: "26m ago",
    unread: true,
  },
  {
    id: "n4",
    kind: "task",
    actor: "Admin",
    surface: "dispatch",
    message: "assigned you a task",
    quote: "Confirm driver for the Peterson wedding Saturday",
    time: "1h ago",
    unread: false,
  },
  {
    id: "n5",
    kind: "system",
    surface: "admin",
    message: "LimoAnywhere sync completed – 34 trips mirrored",
    time: "2h ago",
    unread: false,
  },
];
