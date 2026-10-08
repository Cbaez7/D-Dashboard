import { create } from "zustand";

export type SurfaceId =
  | "dispatch"
  | "map"
  | "inbox"
  | "calls"
  | "chat"
  | "quote"
  | "guide"
  | "clock"
  | "admin";

export type Role = "admin" | "dispatcher";

type AppState = {
  activeSurface: SurfaceId;
  sidebarOpen: boolean;
  commandOpen: boolean;
  profileOpen: boolean;
  role: Role;
  unreadCounts: Partial<Record<SurfaceId, number>>;
  setActiveSurface: (surface: SurfaceId) => void;
  setSidebarOpen: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
  setProfileOpen: (open: boolean) => void;
  setRole: (role: Role) => void;
  setUnreadCount: (surface: SurfaceId, count: number) => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeSurface: "dispatch",
  sidebarOpen: false,
  commandOpen: false,
  profileOpen: false,
  role: "admin",
  unreadCounts: {},
  setActiveSurface: (activeSurface) => set({ activeSurface }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setProfileOpen: (profileOpen) => set({ profileOpen }),
  setRole: (role) => set({ role }),
  setUnreadCount: (surface, count) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [surface]: count },
    })),
}));
