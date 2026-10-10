"use client";

import { useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import type { SopPage } from "@/data/guide";
import { useAppStore } from "@/stores/app-store";
import { useGuideStore } from "@/stores/guide-store";
import SearchIcon from "@/public/assets/images/_common/search.svg";
import GuideIcon from "@/public/assets/images/nav/guide.svg";

export default function Guide() {
  const pages = useGuideStore((state) => state.pages);
  const acknowledgments = useGuideStore((state) => state.acknowledgments);
  const acknowledge = useGuideStore((state) => state.acknowledge);
  const role = useAppStore((state) => state.role);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(pages[0]?.id ?? "");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return pages;
    return pages.filter(
      (page) =>
        page.title.toLowerCase().includes(needle) ||
        page.category.toLowerCase().includes(needle) ||
        page.body.toLowerCase().includes(needle),
    );
  }, [pages, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, SopPage[]>();
    for (const page of filtered) {
      const list = map.get(page.category) ?? [];
      list.push(page);
      map.set(page.category, list);
    }
    return [...map.entries()];
  }, [filtered]);

  const selected = pages.find((page) => page.id === selectedId) ?? filtered[0];
  const acked = selected ? acknowledgments[selected.id] === selected.version : false;

  return (
    <section className="flex min-h-0 min-w-0 flex-1">
      <aside className="border-border flex w-64 shrink-0 flex-col border-r">
        <div className="border-border flex h-14 shrink-0 items-center border-b px-3">
          <div className="relative w-full">
            <SearchIcon
              aria-hidden
              className="text-subtle pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2"
            />
            <Input
              type="search"
              aria-label="Search SOPs"
              placeholder="Search SOPs…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="divide-border flex flex-col divide-y p-2">
            {grouped.map(([category, categoryPages]) => (
              <div key={category} className="py-2 first:pt-0 last:pb-0">
                <p className="caption-style text-subtle px-2 pt-1 pb-2">
                  {category}
                </p>
                {categoryPages.map((page) => {
                  const needsAck =
                    page.requiresAck && acknowledgments[page.id] !== page.version;
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => setSelectedId(page.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[14px] leading-none transition-colors duration-150 ease-power3-out",
                        selected?.id === page.id
                          ? "bg-accent text-foreground"
                          : "text-soft hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{page.title}</span>
                      {needsAck && (
                        <span
                          aria-label="Acknowledgment required"
                          title="Acknowledgment required"
                          className="bg-warning size-1.5 shrink-0 rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            {grouped.length === 0 && (
              <p className="caption-style text-subtle px-2 py-8 text-center">
                No SOPs match &ldquo;{query}&rdquo;.
              </p>
            )}
          </div>
        </ScrollArea>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            <div className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
              <div className="min-w-0">
                <h2 className="truncate">{selected.title}</h2>
                <p className="caption-style text-subtle mt-1">
                  {selected.category} · v{selected.version} · updated{" "}
                  {new Date(selected.updatedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                {selected.requiresAck && (
                  <Button
                    variant={acked ? "secondary" : "primary"}
                    size="md"
                    disabled={acked}
                    onClick={() => acknowledge(selected.id, selected.version)}
                  >
                    {acked ? "Acknowledged" : "Acknowledge"}
                  </Button>
                )}
                {role === "admin" && <EditPageDialog page={selected} />}
              </div>
            </div>
            <ScrollArea className="min-h-0 flex-1">
              <div className="w-full px-6 py-6">
                <SopBody body={selected.body} />
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="bg-muted flex size-12 items-center justify-center rounded-full shadow-[0px_0px_0px_1px_var(--ring-soft)]">
              <GuideIcon aria-hidden className="text-soft size-5" />
            </span>
            <span className="lead-style mt-2 block font-medium">Guide</span>
            <span className="caption-style text-subtle block max-w-64">
              Pick an SOP on the left to read it.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function EditPageDialog({ page }: { page: SopPage }) {
  const savePage = useGuideStore((state) => state.savePage);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(page.title);
  const [category, setCategory] = useState(page.category);
  const [body, setBody] = useState(page.body);
  const [requiresAck, setRequiresAck] = useState(page.requiresAck);

  const submit = () => {
    savePage({ ...page, title, category, body, requiresAck });
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setTitle(page.title);
          setCategory(page.category);
          setBody(page.body);
          setRequiresAck(page.requiresAck);
        }
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" size="md">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit SOP</DialogTitle>
          <DialogDescription>
            Saving bumps the version and re-requests acknowledgment.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sop-title">Title</Label>
              <Input
                id="sop-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sop-category">Category</Label>
              <Input
                id="sop-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sop-body">Body</Label>
            <textarea
              id="sop-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={12}
              className="border-line-strong bg-secondary text-foreground placeholder:text-subtle focus-visible:border-ring w-full rounded-lg border px-3 py-2 text-[14px] leading-relaxed outline-none transition-[border-color] duration-150 ease-power3-out"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={requiresAck}
              onChange={(event) => setRequiresAck(event.target.checked)}
              className="accent-primary size-4"
            />
            <span className="caption-style text-soft">
              Requires acknowledgment
            </span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="secondary" size="md" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={submit}>
            Save v{page.version + 1}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

function SopBody({ body }: { body: string }) {
  const lines = body.split("\n");
  const blocks: { type: string; lines: string[] }[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    let type = "p";
    if (trimmed === "") type = "gap";
    else if (trimmed.startsWith("### ")) type = "h4";
    else if (trimmed.startsWith("## ")) type = "h3";
    else if (trimmed.startsWith("> ")) type = "callout";
    else if (trimmed.startsWith("- ")) type = "li";
    else if (trimmed.includes(" | ")) type = "row";
    const last = blocks[blocks.length - 1];
    if (last && last.type === type && type !== "gap" && type !== "p") {
      last.lines.push(trimmed);
    } else {
      blocks.push({ type, lines: [trimmed] });
    }
  }

  return (
    <div className="flex flex-col gap-3 text-[14px] leading-relaxed text-soft">
      {blocks.map((block, i) => {
        if (block.type === "gap") return null;
        if (block.type === "h3")
          return (
            <h3 key={i} className="mt-4 text-[15px] font-semibold text-foreground first:mt-0">
              {block.lines.map((l) => renderInline(l.replace(/^## /, "")))}
            </h3>
          );
        if (block.type === "h4")
          return (
            <h4 key={i} className="mt-3 text-[13px] font-semibold tracking-wide text-foreground uppercase">
              {block.lines.map((l) => renderInline(l.replace(/^### /, "")))}
            </h4>
          );
        if (block.type === "callout")
          return (
            <div key={i} className="rounded-lg border border-line-strong bg-secondary px-3 py-2 text-[13px]">
              {block.lines.map((l, j) => (
                <p key={j}>{renderInline(l.replace(/^> /, ""))}</p>
              ))}
            </div>
          );
        if (block.type === "li")
          return (
            <ul key={i} className="flex flex-col gap-1 pl-1">
              {block.lines.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span aria-hidden className="text-subtle">-</span>
                  <span className="min-w-0 flex-1">{renderInline(l.replace(/^- /, ""))}</span>
                </li>
              ))}
            </ul>
          );
        if (block.type === "row")
          return (
            <div key={i} className="overflow-x-auto rounded-lg border border-line-strong bg-secondary">
              <table className="w-full text-[12.5px]">
                <tbody>
                  {block.lines.map((l, j) => (
                    <tr key={j} className="border-line-strong border-b last:border-b-0">
                      {l.split(" | ").map((cell, k) => (
                        <td key={k} className="px-3 py-1.5 align-top whitespace-nowrap">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        return (
          <p key={i} className="whitespace-pre-wrap">
            {block.lines.map((l, j) => (
              <span key={j}>{renderInline(l)}{j < block.lines.length - 1 ? " " : ""}</span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
