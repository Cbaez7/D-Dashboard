import { create } from "zustand";
import { TASKS, type Task } from "@/data/tasks";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { fetchTasks, insertTask, updateTaskStatus } from "@/lib/db/tasks";
import { fetchProfileNames } from "@/lib/db/org";
import { useSessionStore } from "@/stores/session-store";

type TasksState = {
  hydrated: boolean;
  live: boolean;
  tasks: Task[];
  members: { id: string; name: string }[];
  hydrate: () => Promise<void>;
  addTask: (task: Omit<Task, "id" | "ref" | "createdAt" | "createdBy">) => Promise<void>;
  setStatus: (id: string, status: Task["status"]) => void;
};

export const useTasksStore = create<TasksState>()((set, get) => ({
  hydrated: false,
  live: false,
  tasks: TASKS,
  members: [],

  hydrate: async () => {
    if (get().hydrated) return;
    const { userId, orgId } = useSessionStore.getState();

    if (!SUPABASE_CONFIGURED || !userId || !orgId) {
      set({ hydrated: true, live: false });
      return;
    }

    try {
      const [tasks, names] = await Promise.all([fetchTasks(), fetchProfileNames()]);
      const members = [...names.entries()].map(([id, name]) => ({ id, name }));
      set({ hydrated: true, live: true, tasks, members });

      const supabase = createClient();
      supabase
        .channel(`tasks:${orgId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "tasks", filter: `org_id=eq.${orgId}` },
          async () => {
            set({ tasks: await fetchTasks() });
          },
        )
        .subscribe();
    } catch {
      set({ hydrated: true, live: false });
    }
  },

  addTask: async (task) => {
    const { userId, orgId, displayName } = useSessionStore.getState();

    if (!get().live || !userId || !orgId) {
      set((state) => ({
        tasks: [
          {
            ...task,
            id: `t-${Date.now()}`,
            ref: Math.max(0, ...state.tasks.map((item) => item.ref)) + 1,
            createdBy: displayName,
            createdAt: new Date().toISOString(),
          },
          ...state.tasks,
        ],
      }));
      return;
    }

    const assigneeId =
      get().members.find((member) => member.name === task.assignee)?.id ?? null;
    try {
      const row = await insertTask({ orgId, userId, task, assigneeId });
      set((state) => ({
        tasks: [
          {
            id: row.id,
            ref: row.ref,
            kind: row.kind,
            title: row.title,
            notes: row.notes ?? "",
            priority: row.priority,
            assignee: task.assignee,
            createdBy: displayName,
            status: row.status,
            dueAt: row.due_at,
            tripRef: row.trip_id,
            createdAt: row.created_at,
          },
          ...state.tasks,
        ],
      }));
    } catch (error) {
      console.error("task create failed", error);
    }
  },

  setStatus: (id, status) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status } : task,
      ),
    }));
    if (get().live) {
      void updateTaskStatus(id, status).catch((error) =>
        console.error("task status failed", error),
      );
    }
  },
}));
