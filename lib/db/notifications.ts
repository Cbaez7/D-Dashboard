import { createClient } from "@/lib/supabase/client";
import type { Notification, NotificationKind } from "@/data/notifications";
import type { SurfaceId } from "@/stores/app-store";

export type NotificationRow = {
  id: number;
  kind: NotificationKind;
  title: string;
  body: string | null;
  surface: string | null;
  ref: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

export function mapNotification(row: NotificationRow): Notification {
  return {
    id: String(row.id),
    kind: row.kind,
    surface: (row.surface as SurfaceId) ?? undefined,
    message: row.title,
    quote: row.body ?? undefined,
    time: row.created_at,
    unread: row.read_at === null,
  };
}

export async function fetchNotifications(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, kind, title, body, surface, ref, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return ((data ?? []) as NotificationRow[]).map(mapNotification);
}

export async function markNotificationRead(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", Number(id))
    .is("read_at", null);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
  if (error) throw error;
}
