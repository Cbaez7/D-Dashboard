"use client";

import Button from "@/components/_ui/button";
import Notifications from "@/components/_common/notifications/notifications";
import { surfaceById } from "@/components/_common/sidebar/nav";
import { useAppStore } from "@/stores/app-store";
import { useSessionStore } from "@/stores/session-store";
import { useClockStore } from "@/stores/clock-store";
import MenuIcon from "@/public/assets/images/_common/menu.svg";
import ActiveDot from "@/public/assets/images/_common/active-dot.svg";
import SearchIcon from "@/public/assets/images/_common/search.svg";

export default function AppHeader() {
  const activeSurface = useAppStore((state) => state.activeSurface);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const setCommandOpen = useAppStore((state) => state.setCommandOpen);
  const setProfileOpen = useAppStore((state) => state.setProfileOpen);
  const checkedIn = useClockStore((state) => state.checkedInAt !== null);
  const displayName = useSessionStore((state) => state.displayName);
  const initials = useSessionStore((state) => state.initials);
  const surface = surfaceById(activeSurface);

  return (
    <header className="shrink-0">
      <div className="flex items-center justify-between gap-2 px-4 py-[14px]">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon aria-hidden className="size-3.5" />
          </Button>
          <h1 className="truncate">{surface?.label ?? "BNG Desk"}</h1>
          {checkedIn && (
            <span className="caption-style bg-muted inline-flex shrink-0 items-center gap-0.5 rounded-full border border-[#363636] py-[3px] pr-[5px] pl-[3px]">
              <ActiveDot aria-hidden className="size-3" />
              On shift
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            aria-label="Search"
            aria-keyshortcuts="Meta+K Control+K"
            onClick={() => setCommandOpen(true)}
          >
            <SearchIcon aria-hidden className="size-3.5" />
          </Button>
          <Notifications />
          <Button
            variant="secondary"
            size="none"
            className="caption-style h-[30px] gap-1.5 py-[5px] pr-[7px] pl-[5px] font-normal"
            aria-label={`Open profile for ${displayName}`}
            onClick={() => setProfileOpen(true)}
          >
            <span
              aria-hidden
              className="bg-muted text-soft flex size-5 items-center justify-center rounded-full text-[9px] font-semibold outline-1 -outline-offset-1 outline-white/10"
            >
              {initials}
            </span>
            <span className="hidden sm:inline">{displayName}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
