"use client";

import AppHeader from "@/components/_common/app-header";
import CommandMenu from "@/components/_common/command-menu";
import ProfileSheet from "@/components/_common/profile-sheet";
import Dispatch from "@/components/dispatch/dispatch";
import LiveMap from "@/components/livemap/livemap";
import Inbox from "@/components/inbox/inbox";
import Calls from "@/components/calls/calls";
import Chat from "@/components/chat/chat";
import Clients from "@/components/clients/clients";
import Quote from "@/components/quote/quote";
import Guide from "@/components/guide/guide";
import Clock from "@/components/clock/clock";
import Admin from "@/components/admin/admin";
import { useAppStore, type SurfaceId } from "@/stores/app-store";

const SURFACE_COMPONENTS: Record<SurfaceId, () => React.JSX.Element> = {
  dispatch: Dispatch,
  map: LiveMap,
  inbox: Inbox,
  calls: Calls,
  chat: Chat,
  clients: Clients,
  quote: Quote,
  guide: Guide,
  clock: Clock,
  admin: Admin,
};

export default function AppShell() {
  const activeSurface = useAppStore((state) => state.activeSurface);
  const role = useAppStore((state) => state.role);
  const Surface =
    activeSurface === "admin" && role !== "admin"
      ? SURFACE_COMPONENTS.dispatch
      : SURFACE_COMPONENTS[activeSurface];

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <AppHeader />
      <Surface />
      <ProfileSheet />
      <CommandMenu />
    </div>
  );
}
