import { create } from "zustand";
import { applyTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

export type SurfaceId =
  | "dispatch"
  | "map"
  | "inbox"
  | "calls"
  | "chat"
  | "clients"
  | "quote"
  | "guide"
  | "clock"
  | "admin";

export type Role = "admin" | "dispatcher";

type AppState = {
  activeSurface: SurfaceId;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  profileOpen: boolean;
  role: Role;
  theme: Theme;
  unreadCounts: Partial<Record<SurfaceId, number>>;
  setActiveSurface: (surface: SurfaceId) => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandOpen: (open: boolean) => void;
  setProfileOpen: (open: boolean) => void;
  setRole: (role: Role) => void;
  setTheme: (theme: Theme) => void;
  setUnreadCount: (surface: SurfaceId, count: number) => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeSurface: "dispatch",
  sidebarOpen: false,
  sidebarCollapsed: false,
  commandOpen: false,
  profileOpen: false,
  role: "admin",
  theme:
    typeof window !== "undefined"
      ? ((localStorage.getItem(THEME_STORAGE_KEY) as Theme) ?? "default")
      : "default",
  unreadCounts: {},
  setActiveSurface: (activeSurface) => set({ activeSurface }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setProfileOpen: (profileOpen) => set({ profileOpen }),
  setRole: (role) => set({ role }),
  setTheme: (theme) => {
    set({ theme });
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
    applyTheme(theme);
  },
  setUnreadCount: (surface, count) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [surface]: count },
    })),
}));
