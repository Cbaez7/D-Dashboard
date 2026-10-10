"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/_ui/sheet";
import SidebarCollapsed from "./sidebar-collapsed";
import SidebarContent from "./sidebar-content";
import SidebarResizer from "./sidebar-resizer";
import { useAppStore } from "@/stores/app-store";

export default function Sidebar() {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  return (
    <>
      {sidebarCollapsed ? (
        <aside className="hidden w-12 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
          <SidebarCollapsed />
        </aside>
      ) : (
        <aside className="relative hidden w-(--sidebar-width) shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
          <SidebarContent />
          <SidebarResizer />
        </aside>
      )}

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[254px] max-w-[85vw] border-sidebar-border bg-sidebar"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            BNG Desk surfaces
          </SheetDescription>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
