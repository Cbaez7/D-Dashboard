"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import SurfacePlaceholder from "@/components/_common/surface-placeholder";
import DispatchIcon from "@/public/assets/images/nav/dispatch.svg";

export default function Dispatch() {
  const [range, setRange] = useState("today");

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Tabs value={range} onValueChange={setRange}>
        <TabsList className="border-border border-b px-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
          <TabsTrigger value="week">This week</TabsTrigger>
        </TabsList>
      </Tabs>
      <SurfacePlaceholder
        icon={DispatchIcon}
        title="Dispatch board"
        description="Today's trips, driver status and the unassigned queue — mirrored from LimoAnywhere."
      />
    </section>
  );
}
