"use client";

import { useMemo, useState, useTransition } from "react";
import Button from "@/components/_ui/button";
import { Checkbox } from "@/components/_ui/checkbox";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/_ui/sheet";
import Tag from "@/components/_ui/tag";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import { formatRelativeTime } from "@/data/notifications";
import { money } from "@/lib/quote/engine";
import { useClientsStore } from "@/stores/clients-store";
import type { Client, TimelineItem } from "@/lib/db/clients";
import type { SavedQuote } from "@/lib/db/quotes";
import PlusIcon from "@/public/assets/images/_common/plus.svg";
import QuoteIcon from "@/public/assets/images/nav/quote.svg";
import ChatIcon from "@/public/assets/images/nav/chat.svg";

function timelineFor(detail: {
  notes: { id: number; author: string; body: string; createdAt: string }[];
  quotes: SavedQuote[];
}): TimelineItem[] {
  const items: TimelineItem[] = detail.notes.map((note) => ({
    id: `note-${note.id}`,
    kind: "note",
    createdAt: note.createdAt,
    title: note.author,
    body: note.body,
  }));
  for (const quote of detail.quotes) {
    items.push({
      id: `quote-${quote.id}`,
      kind: "quote",
      createdAt: quote.createdAt,
      title: `Quote ${quote.status}`,
      body: [quote.tripType, quote.vehicle].filter(Boolean).join(" · "),
      meta: quote.totalCents != null ? money(quote.totalCents / 100) : undefined,
    });
  }
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export default function Clients() {
  const clients = useClientsStore((state) => state.clients);
  const live = useClientsStore((state) => state.live);
  const openDetail = useClientsStore((state) => state.openDetail);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((client) =>
      [client.name, client.company, client.email, client.phone, client.accountName]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }, [clients, query]);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-2.5">
        <Input
          placeholder="Search clients…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-8 max-w-64"
          aria-label="Search clients"
        />
        {live && <ClientDialog mode="create" />}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
          <div className="border-border bg-card overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((client) => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer"
                    onClick={() => void openDetail(client)}
                  >
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {client.name}
                        {client.vip && (
                          <Tag tone="blue" size="sm">
                            VIP
                          </Tag>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-soft">
                      {client.company || "—"}
                    </TableCell>
                    <TableCell className="text-soft">
                      <span className="block max-w-52 truncate">
                        {client.email || client.phone || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-soft">
                      {client.accountName || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex flex-wrap justify-end gap-1">
                        {client.tags.slice(0, 3).map((tag) => (
                          <Tag key={tag} size="sm">
                            {tag}
                          </Tag>
                        ))}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-subtle">
                      {live
                        ? query
                          ? "No clients match that search."
                          : "No clients yet — add the first one."
                        : "The directory needs a database connection."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <ClientDetailSheet />
    </section>
  );
}

function ClientDetailSheet() {
  const detail = useClientsStore((state) => state.detail);
  const detailLoading = useClientsStore((state) => state.detailLoading);
  const closeDetail = useClientsStore((state) => state.closeDetail);
  const addNote = useClientsStore((state) => state.addNote);
  const live = useClientsStore((state) => state.live);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState(false);
  const [pending, startTransition] = useTransition();

  const client = detail?.client;
  const timeline = detail ? timelineFor(detail) : [];

  const submitNote = () => {
    if (!client || !note.trim()) return;
    startTransition(async () => {
      const ok = await addNote(client.id, note);
      if (ok) {
        setNote("");
        setNoteError(false);
      } else {
        setNoteError(true);
      }
    });
  };

  return (
    <Sheet
      open={detail !== null}
      onOpenChange={(open) => {
        if (!open) closeDetail();
      }}
    >
      <SheetContent side="right" className="w-[380px] max-w-[90vw]">
        {client && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {client.name}
                {client.vip && (
                  <Tag tone="blue" size="sm">
                    VIP
                  </Tag>
                )}
              </SheetTitle>
              <SheetDescription>
                {[client.company, client.accountName && `Account: ${client.accountName}`]
                  .filter(Boolean)
                  .join(" · ") || "Client record"}
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-5 py-4">
              <div className="flex flex-col gap-1.5 text-[13px]">
                {client.email && (
                  <span className="text-soft">{client.email}</span>
                )}
                {client.phone && (
                  <span className="text-soft">{client.phone}</span>
                )}
                {!client.email && !client.phone && (
                  <span className="text-subtle">No contact details</span>
                )}
              </div>

              {client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {client.tags.map((tag) => (
                    <Tag key={tag} size="sm">
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}

              {client.notes && (
                <div className="rounded-lg border border-line-strong bg-secondary p-3 text-[12px] whitespace-pre-wrap text-soft">
                  {client.notes}
                </div>
              )}

              {detail && detail.addresses.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold tracking-wide text-subtle uppercase">
                    Saved addresses
                  </span>
                  {detail.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="rounded-lg border border-line-strong bg-secondary px-3 py-2 text-[12px]"
                    >
                      <span className="font-medium text-foreground">
                        {address.label}
                      </span>
                      <span className="text-soft"> — {address.address}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wide text-subtle uppercase">
                    Timeline
                  </span>
                  {live && <ClientDialog mode="edit" client={client} />}
                </div>
                <div className="flex flex-col gap-2">
                  {detailLoading && (
                    <span className="caption-style text-subtle">Loading…</span>
                  )}
                  {!detailLoading &&
                    timeline.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-2.5 rounded-lg border border-line-strong bg-secondary p-3"
                      >
                        <span className="bg-muted mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg shadow-[0px_0px_0px_1px_#232323]">
                          {item.kind === "quote" ? (
                            <QuoteIcon aria-hidden className="text-soft size-3.5" />
                          ) : (
                            <ChatIcon aria-hidden className="text-soft size-3.5" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[12px] font-medium text-foreground">
                              {item.title}
                            </span>
                            {item.meta && (
                              <span className="text-[12px] font-medium text-success tabular-nums">
                                {item.meta}
                              </span>
                            )}
                          </div>
                          {item.body && (
                            <p className="mt-0.5 text-[12px] whitespace-pre-wrap text-soft">
                              {item.body}
                            </p>
                          )}
                          <span className="caption-style text-subtle mt-1 block">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  {!detailLoading && timeline.length === 0 && (
                    <span className="caption-style text-subtle">
                      Nothing yet — add the first note below.
                    </span>
                  )}
                </div>
                {live && (
                  <div className="mt-1 flex flex-col gap-2">
                    <Input
                      placeholder="Add a note…"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") submitNote();
                      }}
                      aria-label="Add a note"
                    />
                    {noteError && (
                      <p className="caption-style text-danger">
                        Could not save the note — try again.
                      </p>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={submitNote}
                      disabled={pending || !note.trim()}
                      className="self-end"
                    >
                      {pending ? "Saving…" : "Add note"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ClientDialog({ mode, client }: { mode: "create" | "edit"; client?: Client }) {
  const accounts = useClientsStore((state) => state.accounts);
  const addClient = useClientsStore((state) => state.addClient);
  const saveClient = useClientsStore((state) => state.saveClient);
  const openDetail = useClientsStore((state) => state.openDetail);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    const tags = String(formData.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const accountValue = String(formData.get("account") ?? "");
    const fields = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
      vip: formData.get("vip") === "on",
      tags,
      notes: String(formData.get("notes") ?? "").trim(),
      accountId: accountValue === "none" ? null : accountValue || null,
    };
    setError(null);
    startTransition(async () => {
      if (mode === "create") {
        const created = await addClient(fields);
        if (!created) {
          setError("Could not create the client — try again.");
          return;
        }
        setOpen(false);
        void openDetail(created);
      } else if (client) {
        const ok = await saveClient(client.id, fields);
        if (!ok) {
          setError("Could not save changes — try again.");
          return;
        }
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button variant="secondary" size="sm">
            <PlusIcon aria-hidden className="size-3" />
            New client
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
            {mode === "create" ? "New client" : `Edit ${client?.name}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Adds a client record to the directory."
              : "Updates the client record."}
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-name">Name</Label>
            <Input
              id="client-name"
              name="name"
              required
              defaultValue={client?.name}
              placeholder="Elena Vargas"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                name="email"
                type="email"
                defaultValue={client?.email ?? ""}
                placeholder="Optional"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="client-phone">Phone</Label>
              <Input
                id="client-phone"
                name="phone"
                defaultValue={client?.phone ?? ""}
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="client-company">Company</Label>
              <Input
                id="client-company"
                name="company"
                defaultValue={client?.company ?? ""}
                placeholder="Optional"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="client-account">Corporate account</Label>
              <Select
                name="account"
                defaultValue={client?.accountId ?? "none"}
              >
                <SelectTrigger id="client-account">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-tags">Tags</Label>
            <Input
              id="client-tags"
              name="tags"
              defaultValue={client?.tags.join(", ")}
              placeholder="frequent, affiliate — comma separated"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-notes">Notes</Label>
            <Input
              id="client-notes"
              name="notes"
              defaultValue={client?.notes}
              placeholder="Preferences, instructions, anything the desk should know"
            />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-soft">
            <Checkbox name="vip" defaultChecked={client?.vip} />
            VIP — flagged for priority handling
          </label>
          {error && <p className="caption-style text-danger">{error}</p>}
          <DialogFooter className="-mx-6 -mb-5">
            <Button variant="primary" size="md" type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Create client" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
