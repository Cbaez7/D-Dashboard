"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
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

type Member = { name: string; role: "admin" | "dispatcher" };

const INITIAL_MEMBERS: Member[] = [
  { name: "Chris Baez", role: "admin" },
  { name: "Maria Santos", role: "dispatcher" },
  { name: "Devon Cole", role: "dispatcher" },
  { name: "Priya Nair", role: "dispatcher" },
];

const INTEGRATIONS = [
  {
    key: "limoanywhere",
    name: "LimoAnywhere",
    note: "Read-only mirror — trips, drivers, invoices",
    status: "Awaiting API access",
  },
  {
    key: "graph",
    name: "Microsoft 365 mail",
    note: "Shared dispatch mailbox via Graph",
    status: "Awaiting consent",
  },
  {
    key: "3cx",
    name: "3CX",
    note: "Call Control API ≥8SC, or CRM-URL webhook",
    status: "Awaiting license check",
  },
  {
    key: "maps",
    name: "Map provider",
    note: "Generic placeholder now, dedicated repo later",
    status: "Placeholder active",
  },
  {
    key: "flights",
    name: "Flight tracking",
    note: "FlightAware or equivalent",
    status: "Not configured",
  },
];

const ACTIVITY = [
  { who: "Maria Santos", what: "Edited SOP “Airport pickup procedure” → v5", when: "2026-10-08T12:15:00Z" },
  { who: "Devon Cole", what: "Completed task #1038 — Stage vehicle 12", when: "2026-10-08T11:40:00Z" },
  { who: "Chris Baez", what: "Linked email thread to trip #4471", when: "2026-10-08T10:05:00Z" },
  { who: "Chris Baez", what: "Issued warning — missed handoff (draft)", when: "2026-10-07T22:31:00Z" },
];

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
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
        </TabsList>
        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4">
            <TabsContent value="team">
              <Team />
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
  const [members, setMembers] = useState(INITIAL_MEMBERS);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2>Team</h2>
        <Button variant="secondary" size="md">
          <UserPlusIcon aria-hidden className="size-3.5" />
          Invite member
        </Button>
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
              <TableRow key={member.name}>
                <TableCell>{member.name}</TableCell>
                <TableCell className="text-right">
                  <Select
                    value={member.role}
                    onValueChange={(role) =>
                      setMembers((list) =>
                        list.map((item) =>
                          item.name === member.name
                            ? { ...item, role: role as Member["role"] }
                            : item,
                        ),
                      )
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

function Integrations() {
  return (
    <div className="flex flex-col gap-3">
      <h2>Integrations</h2>
      <div className="divide-border border-border bg-card divide-y rounded-xl border">
        {INTEGRATIONS.map((integration) => (
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
            <Tag
              tone={integration.status === "Placeholder active" ? "blue" : "amber"}
              size="sm"
            >
              {integration.status}
            </Tag>
          </div>
        ))}
      </div>
      <p className="caption-style text-subtle">
        Credentials land in <code>.env.local</code> — keys live in{" "}
        <code>integration_state</code> per org once the database is provisioned.
      </p>
    </div>
  );
}

function Activity() {
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
            {ACTIVITY.map((event, index) => (
              <TableRow key={index}>
                <TableCell className="text-subtle">
                  {new Date(event.when).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-soft">{event.who}</TableCell>
                <TableCell className="max-w-96">
                  <span className="block truncate">{event.what}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Fleet() {
  const vehicles = [
    { name: "Vehicle 08", plate: "8BNK120", type: "Sedan", status: "active" },
    { name: "Vehicle 12", plate: "8BNK330", type: "SUV", status: "active" },
    { name: "Vehicle 15", plate: "8BNK415", type: "Sprinter", status: "maintenance" },
  ] as const;

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
              <TableRow key={vehicle.name}>
                <TableCell>{vehicle.name}</TableCell>
                <TableCell className="text-soft">{vehicle.plate}</TableCell>
                <TableCell className="text-soft">{vehicle.type}</TableCell>
                <TableCell className="text-right">
                  <Tag
                    tone={vehicle.status === "active" ? "green" : "amber"}
                    size="sm"
                  >
                    {vehicle.status}
                  </Tag>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
