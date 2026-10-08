import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TASKS, type Task } from "@/data/tasks";
import { CURRENT_USER } from "@/data/session";

type TasksState = {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "ref" | "createdAt" | "createdBy">) => void;
  setStatus: (id: string, status: Task["status"]) => void;
};

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      tasks: TASKS,
      addTask: (task) =>
        set((state) => ({
          tasks: [
            {
              ...task,
              id: `t-${Date.now()}`,
              ref: Math.max(0, ...state.tasks.map((item) => item.ref)) + 1,
              createdBy: CURRENT_USER.name,
              createdAt: new Date().toISOString(),
            },
            ...state.tasks,
          ],
        })),
      setStatus: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, status } : task,
          ),
        })),
    }),
    { name: "bng-tasks" },
  ),
);
