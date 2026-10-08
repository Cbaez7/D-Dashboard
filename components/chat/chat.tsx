"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import SurfacePlaceholder from "@/components/_common/surface-placeholder";
import ChatIcon from "@/public/assets/images/nav/chat.svg";

export default function Chat() {
  const [list, setList] = useState("channels");

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Tabs value={list} onValueChange={setList}>
        <TabsList className="border-border border-b px-4">
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="direct">Direct</TabsTrigger>
          <TabsTrigger value="trips">Trip threads</TabsTrigger>
        </TabsList>
      </Tabs>
      <SurfacePlaceholder
        icon={ChatIcon}
        title="Team chat"
        description="Channels, direct messages and threads attached to trips — dispatchers only."
      />
    </section>
  );
}
