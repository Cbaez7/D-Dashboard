"use client";

import Tag from "@/components/_ui/tag";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import {
  formatDuration,
  formatEntryRange,
} from "@/data/clock";
import { useClockStore } from "@/stores/clock-store";
import { useSessionStore } from "@/stores/session-store";

export default function Timesheet() {
  const entries = useClockStore((state) => state.entries);
  const myTz = useSessionStore((state) => state.myTz);

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Actual in / out</TableHead>
            <TableHead>My time</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                {new Date(`${entry.opsDate}T00:00:00Z`).toLocaleDateString(
                  "en-GB",
                  { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" },
                )}
              </TableCell>
              <TableCell className="text-soft">{entry.shiftLabel}</TableCell>
              <TableCell>
                {formatEntryRange(entry, entry.tz)}
                <span className="text-subtle caption-style block mt-1">
                  Location: {entry.location}
                </span>
              </TableCell>
              <TableCell className="text-soft">
                {formatEntryRange(entry, myTz)}
              </TableCell>
              <TableCell className="text-soft">
                {formatDuration(entry.clockInAt, entry.clockOutAt)}
              </TableCell>
              <TableCell className="text-right">
                <Tag
                  tone={entry.clockOutAt ? "neutral" : "teal"}
                  size="sm"
                >
                  {entry.clockOutAt ? "Checked out" : "Checked in"}
                </Tag>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
