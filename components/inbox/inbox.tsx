"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import SurfacePlaceholder from "@/components/_common/surface-placeholder";
import InboxIcon from "@/public/assets/images/nav/inbox.svg";

export default function Inbox() {
  const [folder, setFolder] = useState("inbox");

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Tabs value={folder} onValueChange={setFolder}>
        <TabsList className="border-border border-b px-4">
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
        </TabsList>
      </Tabs>
      <SurfacePlaceholder
        icon={InboxIcon}
        title="Shared mailbox"
        description="The dispatch@ mailbox — read, reply and link threads to trips."
      />
    </section>
  );
}
