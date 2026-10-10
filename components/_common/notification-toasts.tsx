"use client";

import Button from "@/components/_ui/button";
import { formatRelativeTime } from "@/data/notifications";
import { useAppStore } from "@/stores/app-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useToastStore } from "@/stores/toast-store";
import BellIcon from "@/public/assets/images/_common/bell.svg";
import CallsIcon from "@/public/assets/images/nav/calls.svg";
import TripIcon from "@/public/assets/images/nav/dispatch.svg";
import TaskIcon from "@/public/assets/images/nav/guide.svg";
import ChatIcon from "@/public/assets/images/nav/chat.svg";
import XIcon from "@/public/assets/images/_common/x.svg";

const KIND_ICON = {
  call: CallsIcon,
  trip: TripIcon,
  mention: ChatIcon,
  task: TaskIcon,
  system: BellIcon,
} as const;

export default function NotificationToasts() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);
  const setActiveSurface = useAppStore((state) => state.setActiveSurface);
  const markRead = useNotificationsStore((state) => state.markRead);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[60] flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-2"
    >
      {toasts.map((toast) => {
        const Icon = KIND_ICON[toast.kind] ?? BellIcon;
        return (
          <div
            key={toast.id}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (toast.notificationId) markRead(toast.notificationId);
              if (toast.surface) setActiveSurface(toast.surface);
              dismiss(toast.id);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                if (toast.notificationId) markRead(toast.notificationId);
                if (toast.surface) setActiveSurface(toast.surface);
                dismiss(toast.id);
              }
            }}
            className="border-border bg-popover shadow-overlay animate-in fade-in slide-in-from-top-2 flex cursor-pointer items-start gap-3 rounded-xl border p-3 duration-200"
          >
            <span className="bg-muted mt-px flex size-8 shrink-0 items-center justify-center rounded-lg shadow-[0px_0px_0px_1px_var(--ring-soft)]">
              <Icon aria-hidden className="text-soft size-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[13px] leading-snug text-foreground">
                {toast.title}
              </span>
              {toast.body && (
                <span className="caption-style text-soft line-clamp-2">
                  {toast.body}
                </span>
              )}
              <span className="caption-style text-subtle">
                {formatRelativeTime(toast.createdAt)}
              </span>
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Dismiss"
              className="shrink-0"
              onClick={(event) => {
                event.stopPropagation();
                dismiss(toast.id);
              }}
            >
              <XIcon aria-hidden className="size-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
