"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
import { ScrollArea } from "@/components/_ui/scroll-area";
import Tag from "@/components/_ui/tag";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import { CALL_LOG, formatCallDuration } from "@/data/calls";
import CallsIcon from "@/public/assets/images/nav/calls.svg";

const DISPOSITION_TONE = {
  answered: "green",
  missed: "red",
  transferred: "blue",
  voicemail: "amber",
} as const;

export default function Calls() {
  const [popOpen, setPopOpen] = useState(false);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="border-border flex shrink-0 items-center gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h2>Call control</h2>
          <p className="caption-style text-subtle mt-1">
            3CX control-only — audio stays on your desk phone or web client.
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Tag tone="neutral" size="sm">
            3CX link pending
          </Tag>
          <Button variant="secondary" size="md" onClick={() => setPopOpen(true)}>
            Simulate incoming call
          </Button>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4">
          <div className="flex flex-col gap-3">
            <h3>Recent calls</h3>
            <div className="border-border bg-card overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Caller</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Dir</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Trip</TableHead>
                    <TableHead className="text-right">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CALL_LOG.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell className="text-soft">
                        {new Date(call.at).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{call.caller}</TableCell>
                      <TableCell className="text-soft">{call.number}</TableCell>
                      <TableCell className="text-soft">
                        {call.direction === "in" ? "↓ In" : "↑ Out"}
                      </TableCell>
                      <TableCell className="text-soft">
                        {formatCallDuration(call.durationSec)}
                      </TableCell>
                      <TableCell>
                        {call.linkedTrip ? (
                          <Tag tone="blue" size="sm">
                            {call.linkedTrip}
                          </Tag>
                        ) : (
                          <span className="text-subtle">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Tag tone={DISPOSITION_TONE[call.disposition]} size="sm">
                          {call.disposition}
                        </Tag>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ScrollArea>

      {popOpen && <IncomingCallPop onClose={() => setPopOpen(false)} />}
    </section>
  );
}

function IncomingCallPop({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="alertdialog"
      aria-label="Incoming call"
      className="border-line-strong bg-popover fixed right-4 bottom-4 z-50 w-80 rounded-xl border p-4 shadow-overlay"
    >
      <div className="flex items-start gap-3">
        <span className="bg-muted relative flex size-10 shrink-0 items-center justify-center rounded-full">
          <CallsIcon aria-hidden className="text-soft size-4" />
          <span
            aria-hidden
            className="bg-status absolute inset-0 animate-ping rounded-full opacity-25"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] leading-none font-medium">Nadine Ellison</p>
          <p className="caption-style text-subtle mt-1">+1 310 555 0184</p>
          <div className="mt-2 flex items-center gap-1.5">
            <Tag tone="blue" size="sm">
              Trip #4471 tonight 22:15
            </Tag>
            <Tag tone="amber" size="sm">
              VIP account
            </Tag>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" size="md" onClick={onClose}>
          Decline
        </Button>
        <Button variant="primary" size="md" onClick={onClose}>
          Answer on device
        </Button>
      </div>
      <p className="caption-style text-subtle mt-2.5 text-center">
        Answering picks up on your 3CX endpoint — no browser audio yet.
      </p>
    </div>
  );
}
