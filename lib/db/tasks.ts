import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/data/tasks";
import { fetchProfileNames } from "@/lib/db/org";

type TaskRow = {
  id: string;
  ref: number;
  kind: "task" | "ticket";
  title: string;
  notes: string | null;
  priority: Task["priority"];
  assignee_id: string | null;
  created_by: string | null;
  status: Task["status"];
  due_at: string | null;
  trip_id: string | null;
  created_at: string;
};

function mapTask(row: TaskRow, names: Map<string, string>): Task {
  return {
    id: row.id,
    ref: row.ref,
    kind: row.kind,
    title: row.title,
    notes: row.notes ?? "",
    priority: row.priority,
    assignee: row.assignee_id ? (names.get(row.assignee_id) ?? "Teammate") : "Unassigned",
    createdBy: names.get(row.created_by ?? "") ?? "Unknown",
    status: row.status,
    dueAt: row.due_at,
    tripRef: row.trip_id,
    createdAt: row.created_at,
  };
}

export async function fetchTasks() {
  const supabase = createClient();
  const [{ data, error }, names] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "id, ref, kind, title, notes, priority, assignee_id, created_by, status, due_at, trip_id, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200),
    fetchProfileNames(),
  ]);
  if (error) throw error;
  return ((data ?? []) as TaskRow[]).map((row) => mapTask(row, names));
}

export async function insertTask(input: {
  orgId: string;
  userId: string;
  task: Omit<Task, "id" | "ref" | "createdAt" | "createdBy">;
  assigneeId: string | null;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      org_id: input.orgId,
      kind: input.task.kind,
      title: input.task.title,
      notes: input.task.notes || null,
      priority: input.task.priority,
      assignee_id: input.assigneeId,
      created_by: input.userId,
      due_at: input.task.dueAt,
      trip_id: input.task.tripRef,
    })
    .select(
      "id, ref, kind, title, notes, priority, assignee_id, created_by, status, due_at, trip_id, created_at",
    )
    .single();
  if (error) throw error;
  return data as TaskRow;
}

export async function updateTaskStatus(id: string, status: Task["status"]) {
  const supabase = createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
