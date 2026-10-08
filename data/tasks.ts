export type Task = {
  id: string;
  ref: number;
  kind: "task" | "ticket";
  title: string;
  notes: string;
  priority: "low" | "normal" | "high" | "urgent";
  assignee: string;
  createdBy: string;
  status: "open" | "in_progress" | "done" | "closed";
  dueAt: string | null;
  tripRef: string | null;
  createdAt: string;
};

export const TASKS: Task[] = [
  {
    id: "t1",
    ref: 1042,
    kind: "task",
    title: "Confirm driver staging for tonight's LAX pickups",
    notes: "Trips 4471 and 4475 — verify both drivers staged 30 min early.",
    priority: "high",
    assignee: "Chris",
    createdBy: "Maria Santos",
    status: "in_progress",
    dueAt: "2026-10-08T20:00:00Z",
    tripRef: "#4471",
    createdAt: "2026-10-08T11:20:00Z",
  },
  {
    id: "t2",
    ref: 1043,
    kind: "task",
    title: "Update Ellison account VIP notes",
    notes: "Quiet ride + still water preference confirmed by account owner.",
    priority: "normal",
    assignee: "Chris",
    createdBy: "Devon Cole",
    status: "open",
    dueAt: null,
    tripRef: null,
    createdAt: "2026-10-08T09:15:00Z",
  },
  {
    id: "t3",
    ref: 1039,
    kind: "ticket",
    title: "Vehicle 12 rear camera flickering",
    notes: "Reported by driver — needs shop appointment before weekend.",
    priority: "normal",
    assignee: "Chris",
    createdBy: "Chris",
    status: "open",
    dueAt: "2026-10-10T00:00:00Z",
    tripRef: null,
    createdAt: "2026-10-07T22:10:00Z",
  },
];
