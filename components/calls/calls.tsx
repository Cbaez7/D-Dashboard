"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import SurfacePlaceholder from "@/components/_common/surface-placeholder";
import CallsIcon from "@/public/assets/images/nav/calls.svg";

export default function Calls() {
  const [view, setView] = useState("log");

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Tabs value={view} onValueChange={setView}>
        <TabsList className="border-border border-b px-4">
          <TabsTrigger value="log">Log</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
        </TabsList>
      </Tabs>
      <SurfacePlaceholder
        icon={CallsIcon}
        title="Calls"
        description="Incoming calls pop with caller and trip context; the log tracks every call."
      />
    </section>
  );
}
