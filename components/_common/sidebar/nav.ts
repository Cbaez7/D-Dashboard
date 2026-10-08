import type { ComponentType, SVGProps } from "react";
import type { Role, SurfaceId } from "@/stores/app-store";
import DispatchIcon from "@/public/assets/images/nav/dispatch.svg";
import MapIcon from "@/public/assets/images/nav/map.svg";
import InboxIcon from "@/public/assets/images/nav/inbox.svg";
import CallsIcon from "@/public/assets/images/nav/calls.svg";
import ChatIcon from "@/public/assets/images/nav/chat.svg";
import QuoteIcon from "@/public/assets/images/nav/quote.svg";
import GuideIcon from "@/public/assets/images/nav/guide.svg";
import ClockIcon from "@/public/assets/images/nav/clock.svg";
import AdminIcon from "@/public/assets/images/nav/admin.svg";

export type SurfaceDef = {
  id: SurfaceId;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  roles: Role[];
};

export const SURFACES: SurfaceDef[] = [
  { id: "dispatch", label: "Dispatch", icon: DispatchIcon, roles: ["admin", "dispatcher"] },
  { id: "map", label: "Map", icon: MapIcon, roles: ["admin", "dispatcher"] },
  { id: "inbox", label: "Inbox", icon: InboxIcon, roles: ["admin", "dispatcher"] },
  { id: "calls", label: "Calls", icon: CallsIcon, roles: ["admin", "dispatcher"] },
  { id: "chat", label: "Chat", icon: ChatIcon, roles: ["admin", "dispatcher"] },
  { id: "quote", label: "Quote", icon: QuoteIcon, roles: ["admin", "dispatcher"] },
  { id: "guide", label: "Guide", icon: GuideIcon, roles: ["admin", "dispatcher"] },
  { id: "clock", label: "Clock", icon: ClockIcon, roles: ["admin", "dispatcher"] },
  { id: "admin", label: "Admin", icon: AdminIcon, roles: ["admin"] },
];

export const SURFACE_GROUPS: { title: string; surfaces: SurfaceId[] }[] = [
  { title: "Dispatch", surfaces: ["dispatch", "map", "inbox", "calls"] },
  { title: "Workspace", surfaces: ["chat", "quote", "guide", "clock"] },
  { title: "Admin", surfaces: ["admin"] },
];

export function surfaceById(id: SurfaceId) {
  return SURFACES.find((surface) => surface.id === id);
}
