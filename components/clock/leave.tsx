"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/_ui/dialog";
import { Input } from "@/components/_ui/input";
import { Label } from "@/components/_ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
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
  LEAVE_ALLOWANCE_DAYS,
  formatLeaveDates,
  type LeaveRequest,
} from "@/data/clock";
import { useClockStore } from "@/stores/clock-store";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

const STATUS_TONE: Record<LeaveRequest["status"], "amber" | "green" | "red" | "neutral"> = {
  pending: "amber",
  approved: "green",
  denied: "red",
  cancelled: "neutral",
};

function dayCount(startsOn: string, endsOn: string) {
  const start = new Date(`${startsOn}T00:00:00Z`).getTime();
  const end = new Date(`${endsOn}T00:00:00Z`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.round((end - start) / 86_400_000) + 1;
}

export default function Leave() {
  const leaveRequests = useClockStore((state) => state.leaveRequests);
  const requestLeave = useClockStore((state) => state.requestLeave);
  const [open, setOpen] = useState(false);
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [type, setType] = useState<LeaveRequest["type"]>("annual");
  const [reason, setReason] = useState("");

  const used = leaveRequests
    .filter((request) => request.status === "approved")
    .reduce((total, request) => total + request.days, 0);
  const pending = leaveRequests
    .filter((request) => request.status === "pending")
    .reduce((total, request) => total + request.days, 0);
  const remaining = LEAVE_ALLOWANCE_DAYS - used;

  const days = dayCount(startsOn, endsOn);
  const canSubmit = days > 0;

  const submit = () => {
    if (!canSubmit) return;
    requestLeave({ startsOn, endsOn, days, type, reason });
    setOpen(false);
    setStartsOn("");
    setEndsOn("");
    setType("annual");
    setReason("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Annual allowance" value={LEAVE_ALLOWANCE_DAYS} />
        <StatCard label="Used" value={used} />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Remaining" value={remaining} />
      </div>

      <div className="flex items-center justify-between">
        <h3>Requests</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="md">
              <PlusIcon aria-hidden className="size-3.5" />
              Request leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request leave</DialogTitle>
              <DialogDescription>
                Days off are deducted from your annual allowance once approved.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="leave-start">From</Label>
                  <Input
                    id="leave-start"
                    type="date"
                    value={startsOn}
                    onChange={(event) => setStartsOn(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="leave-end">To</Label>
                  <Input
                    id="leave-end"
                    type="date"
                    value={endsOn}
                    onChange={(event) => setEndsOn(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="leave-type">Type</Label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as LeaveRequest["type"])}
                >
                  <SelectTrigger id="leave-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual leave</SelectItem>
                    <SelectItem value="sick">Sick leave</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="leave-reason">Reason</Label>
                <Input
                  id="leave-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Optional"
                />
              </div>
              <p className="caption-style text-soft">
                {days > 0
                  ? `${days} day${days === 1 ? "" : "s"} requested`
                  : "Pick a valid date range"}
              </p>
            </div>
            <DialogFooter>
              <Button variant="secondary" size="md" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={submit} disabled={!canSubmit}>
                Submit request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-xl border">
        {leaveRequests.length === 0 ? (
          <p className="caption-style text-subtle px-4 py-10 text-center">
            No leave requests yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dates</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {formatLeaveDates(request.startsOn, request.endsOn)}
                  </TableCell>
                  <TableCell className="text-soft capitalize">
                    {request.type}
                  </TableCell>
                  <TableCell className="text-soft">{request.days}</TableCell>
                  <TableCell className="text-soft max-w-48 truncate">
                    {request.reason || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Tag tone={STATUS_TONE[request.status]} size="sm">
                      {request.status}
                    </Tag>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-card rounded-xl border px-4 py-3">
      <p className="caption-style text-subtle mb-1.5">{label}</p>
      <p className="text-[20px] leading-none font-medium">{value}</p>
    </div>
  );
}
