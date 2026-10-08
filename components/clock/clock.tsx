"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/_ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import ClockPanel from "./clock-panel";
import Leave from "./leave";
import Timesheet from "./timesheet";

export default function Clock() {
  const [tab, setTab] = useState("timesheet");

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="border-border shrink-0 border-b px-4">
          <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
        </TabsList>
        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4">
            <ClockPanel />
            <TabsContent value="timesheet" className="flex flex-col gap-3">
              <h2>Timesheet</h2>
              <Timesheet />
            </TabsContent>
            <TabsContent value="leave">
              <Leave />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </section>
  );
}
