"use client";

import Button from "@/components/_ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/_ui/sheet";
import Tag from "@/components/_ui/tag";
import { signOut } from "@/app/login/actions";
import { useAppStore } from "@/stores/app-store";
import { useSessionStore } from "@/stores/session-store";
import LogOutIcon from "@/public/assets/images/_common/log-out.svg";

export default function ProfileSheet() {
  const profileOpen = useAppStore((state) => state.profileOpen);
  const setProfileOpen = useAppStore((state) => state.setProfileOpen);
  const role = useAppStore((state) => state.role);
  const displayName = useSessionStore((state) => state.displayName);
  const initials = useSessionStore((state) => state.initials);
  const email = useSessionStore((state) => state.email);

  return (
    <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
      <SheetContent side="right" className="w-[320px] max-w-[85vw]">
        <SheetTitle className="sr-only">Profile</SheetTitle>
        <SheetDescription className="sr-only">
          Account and session
        </SheetDescription>
        <div className="flex flex-col gap-5 p-5">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="bg-muted text-soft flex size-11 items-center justify-center rounded-full text-[15px] font-semibold outline-1 -outline-offset-1 outline-white/10"
            >
              {initials}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="lead-style truncate font-medium">
                {displayName}
              </span>
              <span className="caption-style text-subtle truncate">
                {email}
              </span>
            </div>
          </div>
          <Tag tone="amber" className="w-fit capitalize">
            {role}
          </Tag>
          <div className="border-line-strong border-t pt-4">
            <form action={signOut}>
              <Button variant="secondary" size="md" className="w-full gap-2">
                <LogOutIcon aria-hidden className="size-3.5" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
