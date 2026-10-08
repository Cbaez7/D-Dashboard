"use client";

import { useEffect, useState } from "react";
import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import { formatDuration } from "@/data/clock";
import { useClockStore } from "@/stores/clock-store";
import LogInIcon from "@/public/assets/images/_common/log-in.svg";
import LogOutIcon from "@/public/assets/images/_common/log-out.svg";
import CalendarIcon from "@/public/assets/images/_common/calendar.svg";

export default function ClockPanel() {
  const checkedInAt = useClockStore((state) => state.checkedInAt);
  const shift = useClockStore((state) => state.shift);
  const checkIn = useClockStore((state) => state.checkIn);
  const checkOut = useClockStore((state) => state.checkOut);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!checkedInAt) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [checkedInAt]);

  void now;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="border-border bg-card rounded-xl border p-4">
        <div className="mb-3 flex items-center gap-2">
          <CalendarIcon aria-hidden className="text-subtle size-3.5" />
          <h3>Today&apos;s shift</h3>
          <Tag tone={shift ? "green" : "neutral"} size="sm" className="ml-auto">
            {shift ? "Active" : "None"}
          </Tag>
        </div>
        {shift ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt className="caption-style text-subtle">Time</dt>
            <dd className="text-[14px] leading-none">
              {shift.startTime} – {shift.endTime}
              <span className="text-subtle"> ({shift.tz})</span>
            </dd>
            <dt className="caption-style text-subtle">Service</dt>
            <dd className="text-[14px] leading-none">{shift.serviceType}</dd>
          </dl>
        ) : (
          <p className="caption-style text-soft">
            No shift scheduled for today.
          </p>
        )}
      </div>

      <div className="border-border bg-card rounded-xl border p-4">
        <div className="mb-3 flex items-center gap-2">
          <h3>Attendance</h3>
          <Tag tone={checkedInAt ? "teal" : "neutral"} size="sm" className="ml-auto">
            {checkedInAt ? "Checked in" : "Not checked in"}
          </Tag>
        </div>
        {checkedInAt ? (
          <p className="caption-style text-soft mb-3">
            In since{" "}
            {new Date(checkedInAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · {formatDuration(checkedInAt, null)} elapsed
          </p>
        ) : (
          <p className="caption-style text-soft mb-3">
            You are not currently checked in.
          </p>
        )}
        {checkedInAt ? (
          <Button variant="secondary" size="md" onClick={checkOut}>
            <LogOutIcon aria-hidden className="size-3.5" />
            Check out
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={checkIn}>
            <LogInIcon aria-hidden className="size-3.5" />
            Check in
          </Button>
        )}
      </div>
    </div>
  );
}
