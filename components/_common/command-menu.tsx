"use client";

import { useEffect } from "react";
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandFooter,
  Kbd,
} from "@/components/_ui/command";
import { SURFACES } from "@/components/_common/sidebar/nav";
import { useAppStore } from "@/stores/app-store";

export default function CommandMenu() {
  const commandOpen = useAppStore((state) => state.commandOpen);
  const setCommandOpen = useAppStore((state) => state.setCommandOpen);
  const setActiveSurface = useAppStore((state) => state.setActiveSurface);
  const role = useAppStore((state) => state.role);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandOpen]);

  const surfaces = SURFACES.filter((surface) => surface.roles.includes(role));

  return (
    <CommandDialog
      open={commandOpen}
      onOpenChange={setCommandOpen}
      title="Command menu"
      description="Jump to a surface or run an action"
    >
      <Command>
        <CommandInput placeholder="Search surfaces, trips, drivers…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Surfaces">
            {surfaces.map((surface) => (
              <CommandItem
                key={surface.id}
                onSelect={() => {
                  setActiveSurface(surface.id);
                  setCommandOpen(false);
                }}
              >
                <surface.icon aria-hidden className="size-4" />
                {surface.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        <CommandFooter>
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            Open
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            Close
          </span>
        </CommandFooter>
      </Command>
    </CommandDialog>
  );
}
