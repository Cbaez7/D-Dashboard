"use client";

import { ScrollArea } from "@/components/_ui/scroll-area";
import { cn } from "@/lib/utils";
import { SURFACE_GROUPS, surfaceById } from "./nav";
import { useAppStore } from "@/stores/app-store";
import PanelLeftIcon from "@/public/assets/images/_common/panel-left.svg";

export default function SidebarCollapsed() {
  const activeSurface = useAppStore((state) => state.activeSurface);
  const setActiveSurface = useAppStore((state) => state.setActiveSurface);
  const role = useAppStore((state) => state.role);
  const setSidebarCollapsed = useAppStore(
    (state) => state.setSidebarCollapsed,
  );

  const surfaces = SURFACE_GROUPS.flatMap((group) => group.surfaces)
    .map((id) => surfaceById(id))
    .filter(
      (surface): surface is NonNullable<typeof surface> =>
        surface !== undefined && surface.roles.includes(role),
    );

  return (
    <div className="flex h-full min-h-0 flex-col items-center">
      <div className="border-sidebar-border flex h-14 w-full shrink-0 items-center justify-center border-b">
        <button
          type="button"
          aria-label="Expand sidebar"
          onClick={() => setSidebarCollapsed(false)}
          className="text-subtle hover:bg-muted hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors duration-150 ease-power3-out"
        >
          <PanelLeftIcon aria-hidden className="size-3.5" />
        </button>
      </div>
      <ScrollArea className="w-full min-h-0 flex-1">
        <nav
          aria-label="Primary"
          className="flex flex-col items-center gap-0.5 p-1.5"
        >
          {surfaces.map((surface) => {
            const Icon = surface.icon;
            const active = activeSurface === surface.id;
            return (
              <button
                key={surface.id}
                type="button"
                title={surface.label}
                aria-label={surface.label}
                aria-current={active ? "page" : undefined}
                data-active={active}
                onClick={() => setActiveSurface(surface.id)}
                className={cn(
                  "text-subtle hover:text-icon hover:bg-muted flex size-8 items-center justify-center rounded-lg transition-colors duration-150 ease-power3-out",
                  "data-[active=true]:bg-nav-active data-[active=true]:text-nav-active-foreground data-[active=true]:shadow-[var(--shadow-nav-active)]",
                )}
              >
                <Icon aria-hidden className="size-3.5" />
              </button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
