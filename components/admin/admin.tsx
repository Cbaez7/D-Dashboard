"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/_ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import SurfacePlaceholder from "@/components/_common/surface-placeholder";
import AdminIcon from "@/public/assets/images/nav/admin.svg";

const SECTIONS = [
  { value: "activity", label: "Activity" },
  { value: "tasks", label: "Tasks" },
  { value: "team", label: "Team" },
  { value: "rates", label: "Rates" },
  { value: "guide", label: "Guide" },
  { value: "fleet", label: "Fleet" },
  { value: "integrations", label: "Integrations" },
];

export default function Admin() {
  const [section, setSection] = useState("activity");

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Tabs value={section} onValueChange={setSection}>
        <ScrollArea orientation="horizontal" viewportClassName="w-full">
          <TabsList className="border-border border-b px-4">
            {SECTIONS.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
      </Tabs>
      <SurfacePlaceholder
        icon={AdminIcon}
        title="Admin"
        description="Audit log, task assignment, team roles, rate tables, guide editing, fleet and integration health."
      />
    </section>
  );
}
