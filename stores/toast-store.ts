import { create } from "zustand";
import type { NotificationKind } from "@/data/notifications";
import type { SurfaceId } from "@/stores/app-store";

export type Toast = {
  id: number;
  kind: NotificationKind;
  title: string;
  body?: string;
  surface?: SurfaceId;
  notificationId?: string;
  createdAt: string;
};

type ToastState = {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id" | "createdAt">) => void;
  dismiss: (id: number) => void;
};

let nextId = 1;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (toast) => {
    const id = nextId++;
    set((state) => ({
      toasts: [
        ...state.toasts.slice(-3),
        { ...toast, id, createdAt: new Date().toISOString() },
      ],
    }));
    timers.set(
      id,
      setTimeout(() => useToastStore.getState().dismiss(id), 6000),
    );
  },
  dismiss: (id) => {
    const timer = timers.get(id);
    if (timer) clearTimeout(timer);
    timers.delete(id);
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
