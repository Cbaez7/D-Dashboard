export const OPS_TZ = "America/Los_Angeles";
export const MY_TZ = "America/New_York";

export type Shift = {
  id: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  tz: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  version: number;
  status: "active" | "cancelled";
  serviceType: string;
  acknowledgedAt: string | null;
};

export type ClockEntry = {
  id: string;
  opsDate: string;
  shiftLabel: string;
  clockInAt: string;
  clockOutAt: string | null;
  tz: string;
  location: string;
};

export type LeaveRequest = {
  id: string;
  startsOn: string;
  endsOn: string;
  days: number;
  type: "annual" | "sick" | "unpaid";
  reason: string;
  status: "pending" | "approved" | "denied" | "cancelled";
};

export const LEAVE_ALLOWANCE_DAYS = 20;

export const TODAYS_SHIFT: Shift = {
  id: "shift-v1",
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  startTime: "14:30",
  endTime: "22:30",
  tz: OPS_TZ,
  effectiveFrom: "2026-09-11",
  effectiveTo: null,
  version: 1,
  status: "active",
  serviceType: "Standard",
  acknowledgedAt: "2026-09-10T18:04:00Z",
};

export const CLOCK_ENTRIES: ClockEntry[] = [
  {
    id: "ce-0710",
    opsDate: "2026-10-07",
    shiftLabel: "Unscheduled",
    clockInAt: "2026-10-08T00:23:00Z",
    clockOutAt: "2026-10-08T04:34:00Z",
    tz: OPS_TZ,
    location: "America/Los_Angeles",
  },
  {
    id: "ce-0610",
    opsDate: "2026-10-06",
    shiftLabel: "14:30 – 22:30",
    clockInAt: "2026-10-06T21:26:00Z",
    clockOutAt: "2026-10-07T05:55:00Z",
    tz: OPS_TZ,
    location: "America/Los_Angeles",
  },
  {
    id: "ce-0510",
    opsDate: "2026-10-05",
    shiftLabel: "14:30 – 22:30",
    clockInAt: "2026-10-05T21:25:00Z",
    clockOutAt: "2026-10-06T05:37:00Z",
    tz: OPS_TZ,
    location: "America/Los_Angeles",
  },
  {
    id: "ce-0410",
    opsDate: "2026-10-04",
    shiftLabel: "14:30 – 22:30",
    clockInAt: "2026-10-04T21:34:00Z",
    clockOutAt: "2026-10-05T05:33:00Z",
    tz: OPS_TZ,
    location: "America/Los_Angeles",
  },
  {
    id: "ce-0310",
    opsDate: "2026-10-03",
    shiftLabel: "14:30 – 22:30",
    clockInAt: "2026-10-03T21:26:00Z",
    clockOutAt: "2026-10-04T05:38:00Z",
    tz: OPS_TZ,
    location: "America/Los_Angeles",
  },
];

export const LEAVE_REQUESTS: LeaveRequest[] = [];

const dtf = (tz: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: tz, ...options });

const TIME_OPTS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

const DAY_TIME_OPTS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

export function formatDayTime(iso: string, tz: string) {
  return dtf(tz, DAY_TIME_OPTS).format(new Date(iso));
}

export function formatTime(iso: string, tz: string) {
  return dtf(tz, TIME_OPTS).format(new Date(iso));
}

export function formatEntryRange(entry: ClockEntry, tz: string) {
  const out = entry.clockOutAt
    ? formatDayTime(entry.clockOutAt, tz)
    : "still in";
  return `${formatDayTime(entry.clockInAt, tz)} – ${out}`;
}

export function formatDuration(inIso: string, outIso: string | null) {
  const end = outIso ? new Date(outIso).getTime() : Date.now();
  const mins = Math.max(0, Math.round((end - new Date(inIso).getTime()) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function formatLeaveDates(startsOn: string, endsOn: string) {
  const fmt = dtf("UTC", { day: "2-digit", month: "short", year: "numeric" });
  const start = fmt.format(new Date(`${startsOn}T00:00:00Z`));
  const end = fmt.format(new Date(`${endsOn}T00:00:00Z`));
  return start === end ? start : `${start} – ${end}`;
}
