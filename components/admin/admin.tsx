"use client";

import { useState, useTransition } from "react";
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
import { ScrollArea } from "@/components/_ui/scroll-area";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import UserPlusIcon from "@/public/assets/images/_common/user-plus.svg";
import PlusIcon from "@/public/assets/images/_common/plus.svg";
import { inviteMember } from "@/app/actions/admin";
import { useAdminStore } from "@/stores/admin-store";
import { useClientsStore } from "@/stores/clients-store";
import type { Account } from "@/lib/db/clients";
import { useSessionStore } from "@/stores/session-store";
import type { IntegrationState, Member, Vehicle } from "@/lib/db/admin";

const INTEGRATIONS = [
  {
    key: "limoanywhere",
    name: "LimoAnywhere",
    note: "Read-only mirror – trips, drivers, invoices",
    fallback: "Awaiting API access",
  },
  {
    key: "graph",
    name: "Microsoft 365 mail",
    note: "Shared dispatch mailbox via Graph",
    fallback: "Awaiting consent",
  },
  {
    key: "3cx",
    name: "3CX",
    note: "Call Control API ≥8SC, or CRM-URL webhook",
    fallback: "Awaiting license check",
  },
  {
    key: "maps",
    name: "Map provider",
    note: "Generic placeholder now, dedicated repo later",
    fallback: "Placeholder active",
  },
  {
    key: "flights",
    name: "Flight tracking",
    note: "FlightAware or equivalent",
    fallback: "Not configured",
  },
];

function integrationDisplay(state: IntegrationState | undefined, fallback: string) {
  if (!state) return { label: fallback, tone: fallback === "Placeholder active" ? "blue" : "amber" } as const;
  if (state.status === "ok") return { label: "Connected", tone: "green" } as const;
  if (state.status === "error") return { label: "Error", tone: "red" } as const;
  return { label: "Pending", tone: "amber" } as const;
}

export default function Admin() {
  const [tab, setTab] = useState("team");

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="border-border shrink-0 border-b px-4">
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
        </TabsList>
        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4">
            <TabsContent value="team">
              <Team />
            </TabsContent>
            <TabsContent value="accounts">
              <Accounts />
            </TabsContent>
            <TabsContent value="integrations">
              <Integrations />
            </TabsContent>
            <TabsContent value="activity">
              <Activity />
            </TabsContent>
            <TabsContent value="fleet">
              <Fleet />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </section>
  );
}

function Team() {
  const members = useAdminStore((state) => state.members);
  const setMemberRole = useAdminStore((state) => state.setMemberRole);
  const live = useAdminStore((state) => state.live);
  const currentUserId = useSessionStore((state) => state.userId);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2>Team</h2>
        {live && <InviteDialog />}
      </div>
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead className="text-right">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  {member.name}
                  {member.id === currentUserId && (
                    <span className="text-subtle caption-style ml-2">you</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Select
                    value={member.role}
                    disabled={!live || member.id === currentUserId}
                    onValueChange={(role) =>
                      setMemberRole(member.id, role as Member["role"])
                    }
                  >
                    <SelectTrigger
                      className="ml-auto h-7 w-32"
                      aria-label={`Role for ${member.name}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dispatcher">Dispatcher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Accounts() {
  const accounts = useClientsStore((state) => state.accounts);
  const live = useClientsStore((state) => state.live);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2>Corporate accounts</h2>
        {live && <AccountDialog mode="create" />}
      </div>
      <div className="divide-border border-border bg-card divide-y rounded-xl border">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center gap-4 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] leading-none font-medium">
                {account.name}
              </p>
              <p className="caption-style text-subtle mt-1 truncate">
                {account.billingEmail
                  ? `Billing: ${account.billingEmail}`
                  : "No billing email"}
                {account.notes ? ` – ${account.notes}` : ""}
              </p>
            </div>
            <AccountDialog mode="edit" account={account} />
          </div>
        ))}
        {accounts.length === 0 && (
          <p className="caption-style text-subtle px-4 py-3">
            {live
              ? "No accounts yet – the quoter still uses the built-in rate cards."
              : "Accounts need a database connection."}
          </p>
        )}
      </div>
      <p className="caption-style text-subtle">
        Rate-card notes are what dispatchers read in the quoter – edits apply
        everywhere the account appears.
      </p>
    </div>
  );
}

function AccountDialog({
  mode,
  account,
}: {
  mode: "create" | "edit";
  account?: Account;
}) {
  const saveAccount = useClientsStore((state) => state.saveAccount);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    const fields = {
      id: account?.id,
      name: String(formData.get("name") ?? "").trim(),
      billingEmail: String(formData.get("billingEmail") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim(),
    };
    setError(null);
    startTransition(async () => {
      const ok = await saveAccount(fields);
      if (!ok) {
        setError("Could not save the account – try again.");
        return;
      }
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button variant="secondary" size="md">
            <PlusIcon aria-hidden className="size-3.5" />
            Add account
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add account" : `Edit ${account?.name}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Creates a corporate account with a rate-card note."
              : "Updates the account; new notes reach the quoter on save."}
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account-name">Name</Label>
            <Input
              id="account-name"
              name="name"
              required
              defaultValue={account?.name}
              placeholder="Veeam & NetJets"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account-billing">Billing email</Label>
            <Input
              id="account-billing"
              name="billingEmail"
              type="email"
              defaultValue={account?.billingEmail ?? ""}
              placeholder="Optional"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account-notes">Rate-card notes</Label>
            <textarea
              id="account-notes"
              name="notes"
              rows={5}
              defaultValue={account?.notes}
              placeholder="Airport rules, minimums, who to bill – what a dispatcher needs to quote this account."
              className="border-line-strong bg-secondary placeholder:text-subtle focus-visible:border-ring text-foreground ease-power3-out w-full min-w-0 rounded-lg border px-3 py-2 text-[14px] leading-normal outline-none transition-[border-color] duration-150"
            />
          </div>
          {error && <p className="caption-style text-danger">{error}</p>}
          <DialogFooter className="-mx-6 -mb-5">
            <Button variant="primary" size="md" type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Add account" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InviteDialog() {
  const refresh = useAdminStore((state) => state.refresh);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    const email = String(formData.get("email") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const role = String(formData.get("role") ?? "dispatcher") as
      | "admin"
      | "dispatcher";
    setError(null);
    startTransition(async () => {
      const result = await inviteMember(email, name, role);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      void refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="md">
          <UserPlusIcon aria-hidden className="size-3.5" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Sends an email invite; they set their own password on first sign-in.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-name">Name</Label>
            <Input id="invite-name" name="name" required placeholder="Maria Santos" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              required
              placeholder="maria@bnglimo.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <Select name="role" defaultValue="dispatcher">
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dispatcher">Dispatcher</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="caption-style text-danger">{error}</p>}
          <DialogFooter className="-mx-6 -mb-5">
            <Button variant="primary" size="md" type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Integrations() {
  const states = useAdminStore((state) => state.integrations);

  return (
    <div className="flex flex-col gap-3">
      <h2>Integrations</h2>
      <div className="divide-border border-border bg-card divide-y rounded-xl border">
        {INTEGRATIONS.map((integration) => {
          const display = integrationDisplay(
            states.find((state) => state.key === integration.key),
            integration.fallback,
          );
          return (
            <div
              key={integration.key}
              className="flex items-center gap-4 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-none font-medium">
                  {integration.name}
                </p>
                <p className="caption-style text-subtle mt-1">
                  {integration.note}
                </p>
              </div>
              <Tag tone={display.tone} size="sm">
                {display.label}
              </Tag>
            </div>
          );
        })}
      </div>
      <p className="caption-style text-subtle">
        Credentials land in <code>.env.local</code> – sync state lives in{" "}
        <code>integration_state</code> per org.
      </p>
    </div>
  );
}

function Activity() {
  const activity = useAdminStore((state) => state.activity);

  return (
    <div className="flex flex-col gap-3">
      <h2>Activity</h2>
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Who</TableHead>
              <TableHead>What</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activity.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="text-subtle">
                  {new Date(event.createdAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-soft">{event.actor}</TableCell>
                <TableCell className="max-w-96">
                  <span className="block truncate">
                    {event.action}
                    {event.entity && (
                      <span className="text-subtle">
                        {" "}
                        · {event.entity}
                        {event.entityId ? ` ${event.entityId.slice(0, 8)}` : ""}
                      </span>
                    )}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {activity.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-subtle">
                  No activity yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Fleet() {
  const vehicles = useAdminStore((state) => state.vehicles);
  const setVehicleStatus = useAdminStore((state) => state.setVehicleStatus);
  const live = useAdminStore((state) => state.live);

  return (
    <div className="flex flex-col gap-3">
      <h2>Fleet</h2>
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>{vehicle.name}</TableCell>
                <TableCell className="text-soft">{vehicle.plate}</TableCell>
                <TableCell className="text-soft">{vehicle.type}</TableCell>
                <TableCell className="text-right">
                  {live ? (
                    <Select
                      value={vehicle.status}
                      onValueChange={(status) =>
                        setVehicleStatus(
                          vehicle.id,
                          status as Vehicle["status"],
                        )
                      }
                    >
                      <SelectTrigger
                        className="ml-auto h-7 w-36"
                        aria-label={`Status for ${vehicle.name}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="out">Out</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Tag
                      tone={vehicle.status === "active" ? "green" : "amber"}
                      size="sm"
                    >
                      {vehicle.status}
                    </Tag>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {vehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-subtle">
                  No vehicles yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
