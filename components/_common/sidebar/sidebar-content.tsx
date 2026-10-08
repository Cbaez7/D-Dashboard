"use client";

import { ScrollArea } from "@/components/_ui/scroll-area";
import SidebarNavItem from "./sidebar-nav-item";
import SidebarSection from "./sidebar-section";
import { SURFACE_GROUPS, surfaceById } from "./nav";
import { useAppStore } from "@/stores/app-store";
import { useChatStore } from "@/stores/chat-store";
import { useSessionStore } from "@/stores/session-store";
import Logo from "@/public/assets/images/_common/logo.svg";
import UserPlusIcon from "@/public/assets/images/_common/user-plus.svg";
import HelpIcon from "@/public/assets/images/_common/help.svg";

export default function SidebarContent() {
  const activeSurface = useAppStore((state) => state.activeSurface);
  const setActiveSurface = useAppStore((state) => state.setActiveSurface);
  const role = useAppStore((state) => state.role);
  const unreadCounts = useAppStore((state) => state.unreadCounts);
  const messages = useChatStore((state) => state.messages);
  const lastRead = useChatStore((state) => state.lastRead);
  const displayName = useSessionStore((state) => state.displayName);
  const channels = useChatStore((state) => state.channels);
  const chatUnread = channels.reduce(
    (total, channel) =>
      total +
      messages.filter(
        (message) =>
          message.channelId === channel.id &&
          message.createdAt > (lastRead[channel.id] ?? "") &&
          message.author !== displayName,
      ).length,
    0,
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-sidebar-border bg-sidebar-accent flex shrink-0 items-center gap-2 border-b p-3">
        <Logo aria-hidden className="size-8 shrink-0 overflow-visible" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="lead-style block truncate font-medium tracking-[-0.01em]">
            BNG Desk
          </span>
          <span className="caption-style text-subtle block truncate">
            Dispatch console
          </span>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label="Primary">
          {SURFACE_GROUPS.map((group, index) => {
            const items = group.surfaces
              .map((id) => surfaceById(id))
              .filter(
                (surface): surface is NonNullable<typeof surface> =>
                  surface !== undefined && surface.roles.includes(role),
              );

            if (items.length === 0) return null;

            return (
              <SidebarSection
                key={group.title}
                title={group.title}
                className={
                  index < SURFACE_GROUPS.length - 1
                    ? "border-sidebar-border border-b"
                    : undefined
                }
              >
                {items.map((surface) => (
                  <SidebarNavItem
                    key={surface.id}
                    icon={surface.icon}
                    label={surface.label}
                    count={
                      surface.id === "chat"
                        ? chatUnread || undefined
                        : unreadCounts[surface.id]
                    }
                    active={activeSurface === surface.id}
                    onClick={() => setActiveSurface(surface.id)}
                  />
                ))}
              </SidebarSection>
            );
          })}
        </nav>
      </ScrollArea>

      <SidebarSection className="border-sidebar-border shrink-0 border-t">
        <SidebarNavItem icon={UserPlusIcon} label="Invite teammates" tone="quiet" />
        <SidebarNavItem icon={HelpIcon} label="Help" tone="quiet" />
      </SidebarSection>
    </div>
  );
}
