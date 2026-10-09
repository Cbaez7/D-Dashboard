import Button from "@/components/_ui/button";
import { formatRelativeTime, type Notification } from "@/data/notifications";
import BellIcon from "@/public/assets/images/_common/bell.svg";
import CallsIcon from "@/public/assets/images/nav/calls.svg";
import TripIcon from "@/public/assets/images/nav/dispatch.svg";
import TaskIcon from "@/public/assets/images/nav/guide.svg";
import ChatIcon from "@/public/assets/images/nav/chat.svg";

const KIND_ICON = {
  call: CallsIcon,
  trip: TripIcon,
  mention: ChatIcon,
  task: TaskIcon,
  system: BellIcon,
} as const;

type NotificationItemProps = {
  notification: Notification;
  unread: boolean;
  onSelect: () => void;
};

export default function NotificationItem({
  notification,
  unread,
  onSelect,
}: NotificationItemProps) {
  const Icon = KIND_ICON[notification.kind];

  return (
    <li className="relative">
      <Button
        variant="item"
        size="none"
        onClick={onSelect}
        data-unread={unread}
        className="p-3 data-[unread=true]:bg-white/2 data-[unread=true]:hover:bg-white/5"
      >
        <span className="bg-muted relative mt-px flex size-8 shrink-0 items-center justify-center rounded-lg shadow-[0px_0px_0px_1px_#232323]">
          <Icon aria-hidden className="text-soft size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-2 pr-4">
          <span className="p-style text-soft block">
            {notification.actor && (
              <span className="text-foreground font-medium">
                {notification.actor}{" "}
              </span>
            )}
            {notification.message}
          </span>
          {notification.quote && (
            <span className="p-style border-line-strong text-soft block rounded-lg border bg-white/3 px-3 py-2">
              {notification.quote}
            </span>
          )}
          <span className="caption-style text-subtle flex items-center gap-1.5">
            {formatRelativeTime(notification.time)}
          </span>
        </span>
        {unread && <span className="sr-only">Unread</span>}
      </Button>
      {unread && (
        <span
          aria-hidden
          className="bg-danger pointer-events-none absolute top-4 right-3 size-1.5 rounded-full"
        />
      )}
    </li>
  );
}
