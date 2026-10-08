"use client";

import Tag from "@/components/_ui/tag";
import { cn } from "@/lib/utils";

type MapPin = {
  id: string;
  label: string;
  kind: "driver" | "pickup" | "dropoff";
  status: string;
  x: number;
  y: number;
};

const PINS: MapPin[] = [
  { id: "d1", label: "Devon Cole", kind: "driver", status: "Staged — LAX-it", x: 22, y: 72 },
  { id: "d2", label: "Vehicle 08", kind: "driver", status: "En route", x: 58, y: 44 },
  { id: "p1", label: "Pickup #4471", kind: "pickup", status: "LAX · 22:15", x: 24, y: 70 },
  { id: "r1", label: "Dropoff #4471", kind: "dropoff", status: "Beverly Hills", x: 46, y: 30 },
  { id: "d3", label: "Vehicle 12", kind: "driver", status: "Idle", x: 74, y: 58 },
];

const PIN_STYLES: Record<MapPin["kind"], string> = {
  driver: "bg-status",
  pickup: "bg-primary",
  dropoff: "bg-tag-blue-text",
};

export default function LiveMap() {
  return (
    <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(#232323 1px, transparent 1px), linear-gradient(90deg, #232323 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.35,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(#2a2a2a 2px, transparent 2px), linear-gradient(90deg, #2a2a2a 2px, transparent 2px)",
          backgroundSize: "240px 240px",
          opacity: 0.4,
        }}
      />

      <svg
        aria-hidden
        className="absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M 24 70 C 32 62, 40 42, 46 30"
          fill="none"
          stroke="#c9a968"
          strokeWidth="0.4"
          strokeDasharray="1.5 1.5"
          opacity="0.7"
        />
        <path
          d="M 22 72 C 30 60, 44 50, 58 44"
          fill="none"
          stroke="#16c89e"
          strokeWidth="0.35"
          opacity="0.5"
        />
      </svg>

      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="border-border bg-popover/90 rounded-xl border p-3 shadow-overlay backdrop-blur-sm">
          <p className="caption-style text-subtle mb-2">Fleet — live</p>
          <div className="flex flex-col gap-1.5">
            <LegendDot className="bg-status" label="2 drivers on trips" />
            <LegendDot className="bg-primary" label="1 pickup pending" />
            <LegendDot className="bg-tag-blue-text" label="1 dropoff pending" />
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <Tag tone="neutral" size="md">
          Generic map — provider TBD
        </Tag>
      </div>

      {PINS.map((pin) => (
        <div
          key={pin.id}
          className="group absolute z-10"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          <span
            className={cn(
              "relative block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_3px_rgba(0,0,0,0.35)]",
              PIN_STYLES[pin.kind],
            )}
          >
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full bg-inherit opacity-40"
            />
          </span>
          <div className="border-line-strong bg-popover pointer-events-none absolute top-3 left-1/2 w-max max-w-48 -translate-x-1/2 rounded-lg border px-2.5 py-1.5 opacity-0 shadow-overlay transition-opacity duration-150 ease-power3-out group-hover:opacity-100">
            <p className="caption-style font-medium">{pin.label}</p>
            <p className="caption-style text-subtle mt-0.5">{pin.status}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className={cn("size-2 rounded-full", className)} />
      <span className="caption-style text-soft">{label}</span>
    </span>
  );
}
