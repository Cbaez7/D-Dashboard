export type CallLogEntry = {
  id: string;
  direction: "in" | "out";
  caller: string;
  number: string;
  at: string;
  durationSec: number;
  disposition: "answered" | "missed" | "transferred" | "voicemail";
  linkedTrip: string | null;
};

export const CALL_LOG: CallLogEntry[] = [
  {
    id: "call-1",
    direction: "in",
    caller: "Nadine Ellison",
    number: "+1 310 555 0184",
    at: "2026-10-08T12:40:00Z",
    durationSec: 214,
    disposition: "answered",
    linkedTrip: "#4471",
  },
  {
    id: "call-2",
    direction: "in",
    caller: "Unknown",
    number: "+1 213 555 0149",
    at: "2026-10-08T11:05:00Z",
    durationSec: 0,
    disposition: "missed",
    linkedTrip: null,
  },
  {
    id: "call-3",
    direction: "out",
    caller: "Signature Flight LAX",
    number: "+1 310 555 0166",
    at: "2026-10-08T09:52:00Z",
    durationSec: 96,
    disposition: "answered",
    linkedTrip: null,
  },
  {
    id: "call-4",
    direction: "in",
    caller: "Meridian Travel",
    number: "+1 212 555 0128",
    at: "2026-10-07T17:20:00Z",
    durationSec: 388,
    disposition: "transferred",
    linkedTrip: null,
  },
];

export function formatCallDuration(seconds: number) {
  if (seconds === 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}
