import { createClient } from "@/lib/supabase/client";
import type { ClockEntry, LeaveRequest, Shift } from "@/data/clock";

type ShiftRow = {
  id: string;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  tz: string;
  effective_from: string;
  effective_to: string | null;
  version: number;
  status: "active" | "cancelled";
  service_type: string;
  acknowledged_at: string | null;
};

type ClockEntryRow = {
  id: string;
  clock_in_at: string;
  clock_out_at: string | null;
  tz: string | null;
  location: string | null;
  shifts:
    | { start_time: string; end_time: string; tz: string }
    | { start_time: string; end_time: string; tz: string }[]
    | null;
};

type LeaveRow = {
  id: string;
  starts_on: string;
  ends_on: string;
  days: number;
  type: LeaveRequest["type"];
  reason: string | null;
  status: LeaveRequest["status"];
};

const opsDateFmt = (tz: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

export function mapShift(row: ShiftRow): Shift {
  return {
    id: row.id,
    daysOfWeek: row.days_of_week,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    tz: row.tz,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    version: row.version,
    status: row.status,
    serviceType: row.service_type,
    acknowledgedAt: row.acknowledged_at,
  };
}

function mapEntry(row: ClockEntryRow, opsTz: string): ClockEntry {
  const tz = row.tz ?? opsTz;
  const shift = Array.isArray(row.shifts) ? row.shifts[0] : row.shifts;
  return {
    id: row.id,
    opsDate: opsDateFmt(tz).format(new Date(row.clock_in_at)),
    shiftLabel: shift
      ? `${shift.start_time.slice(0, 5)} – ${shift.end_time.slice(0, 5)}`
      : "Unscheduled",
    clockInAt: row.clock_in_at,
    clockOutAt: row.clock_out_at,
    tz,
    location: row.location ?? tz,
  };
}

function mapLeave(row: LeaveRow): LeaveRequest {
  return {
    id: row.id,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    days: row.days,
    type: row.type,
    reason: row.reason ?? "",
    status: row.status,
  };
}

export async function fetchClockSnapshot(userId: string, opsTz: string) {
  const supabase = createClient();

  const [{ data: entries }, { data: leaves }, { data: shifts }] =
    await Promise.all([
      supabase
        .from("clock_entries")
        .select("id, clock_in_at, clock_out_at, tz, location, shifts(start_time, end_time, tz)")
        .eq("user_id", userId)
        .order("clock_in_at", { ascending: false })
        .limit(60),
      supabase
        .from("leave_requests")
        .select("id, starts_on, ends_on, days, type, reason, status")
        .eq("user_id", userId)
        .order("starts_on", { ascending: false })
        .limit(50),
      supabase
        .from("shifts")
        .select(
          "id, days_of_week, start_time, end_time, tz, effective_from, effective_to, version, status, service_type, acknowledged_at",
        )
        .eq("user_id", userId)
        .eq("status", "active")
        .order("version", { ascending: false }),
    ]);

  const now = new Date();
  const opsToday = opsDateFmt(opsTz).format(now);
  const parts = Object.fromEntries(
    opsDateFmt(opsTz)
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  const opsWeekday = new Date(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)),
  ).getUTCDay();

  const shiftRows = (shifts ?? []) as ShiftRow[];
  const todayShift =
    shiftRows.find(
      (shift) =>
        shift.effective_from <= opsToday &&
        (shift.effective_to === null || shift.effective_to >= opsToday) &&
        (shift.days_of_week.length === 0 ||
          shift.days_of_week.includes(opsWeekday)),
    ) ?? null;

  const mappedEntries = ((entries ?? []) as ClockEntryRow[]).map((row) =>
    mapEntry(row, opsTz),
  );
  const open = mappedEntries.find((entry) => entry.clockOutAt === null) ?? null;

  return {
    entries: mappedEntries,
    openEntry: open,
    leaveRequests: ((leaves ?? []) as LeaveRow[]).map(mapLeave),
    shift: todayShift ? mapShift(todayShift) : null,
  };
}

export async function insertClockIn(input: {
  orgId: string;
  userId: string;
  shiftId: string | null;
  opsTz: string;
}) {
  const supabase = createClient();
  const location = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { data, error } = await supabase
    .from("clock_entries")
    .insert({
      org_id: input.orgId,
      user_id: input.userId,
      shift_id: input.shiftId,
      tz: input.opsTz,
      location,
    })
    .select("id, clock_in_at, clock_out_at, tz, location, shifts(start_time, end_time, tz)")
    .single();
  if (error) throw error;
  return mapEntry(data as ClockEntryRow, input.opsTz);
}

export async function updateClockOut(entryId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("clock_entries")
    .update({ clock_out_at: new Date().toISOString() })
    .eq("id", entryId)
    .is("clock_out_at", null);
  if (error) throw error;
}

export async function insertLeaveRequest(input: {
  orgId: string;
  userId: string;
  startsOn: string;
  endsOn: string;
  days: number;
  type: LeaveRequest["type"];
  reason: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leave_requests")
    .insert({
      org_id: input.orgId,
      user_id: input.userId,
      starts_on: input.startsOn,
      ends_on: input.endsOn,
      days: input.days,
      type: input.type,
      reason: input.reason || null,
    })
    .select("id, starts_on, ends_on, days, type, reason, status")
    .single();
  if (error) throw error;
  return mapLeave(data as LeaveRow);
}
