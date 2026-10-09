import { createClient } from "@/lib/supabase/client";
import { fetchProfileNames } from "@/lib/db/org";

export type Member = {
  id: string;
  name: string;
  role: "admin" | "dispatcher";
};

export type IntegrationState = {
  key: string;
  status: "pending" | "ok" | "error";
  error: string | null;
  lastSyncAt: string | null;
};

export type AuditEvent = {
  id: number;
  actor: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
};

export type Vehicle = {
  id: string;
  name: string;
  plate: string | null;
  type: string | null;
  status: "active" | "maintenance" | "out";
};

export async function fetchMembers(): Promise<Member[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("org_members")
    .select("user_id, role, created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;

  const names = await fetchProfileNames();
  return (data ?? []).map((row) => ({
    id: row.user_id,
    name: names.get(row.user_id) ?? "Teammate",
    role: row.role as Member["role"],
  }));
}

export async function fetchIntegrationStates(): Promise<IntegrationState[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("integration_state")
    .select("key, status, error, last_sync_at");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    key: row.key,
    status: row.status as IntegrationState["status"],
    error: row.error,
    lastSyncAt: row.last_sync_at,
  }));
}

export async function fetchAuditEvents(): Promise<AuditEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("audit_events")
    .select("id, actor_id, action, entity, entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;

  const names = await fetchProfileNames();
  return (data ?? []).map((row) => ({
    id: row.id,
    actor: row.actor_id ? (names.get(row.actor_id) ?? "Former member") : "System",
    action: row.action,
    entity: row.entity,
    entityId: row.entity_id,
    createdAt: row.created_at,
  }));
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, name, plate, type, status")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    plate: row.plate,
    type: row.type,
    status: row.status as Vehicle["status"],
  }));
}

export async function insertAuditEvent(
  orgId: string,
  action: string,
  entity: string,
  entityId?: string,
) {
  const supabase = createClient();
  const { error } = await supabase.from("audit_events").insert({
    org_id: orgId,
    action,
    entity,
    entity_id: entityId ?? null,
  });
  if (error) throw error;
}

export async function updateMemberRole(
  orgId: string,
  userId: string,
  role: Member["role"],
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("org_members")
    .update({ role })
    .eq("org_id", orgId)
    .eq("user_id", userId);
  if (error) throw error;
  await insertAuditEvent(
    orgId,
    `set role to ${role}`,
    "org_member",
    userId,
  ).catch(() => {});
}

export async function updateVehicleStatus(
  orgId: string,
  id: string,
  status: Vehicle["status"],
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("vehicles")
    .update({ status })
    .eq("org_id", orgId)
    .eq("id", id);
  if (error) throw error;
  await insertAuditEvent(
    orgId,
    `set status to ${status}`,
    "vehicle",
    id,
  ).catch(() => {});
}
