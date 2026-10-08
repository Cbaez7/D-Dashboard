"use client";

import Button from "@/components/_ui/button";
import SurfacePlaceholder from "@/components/_common/surface-placeholder";
import QuoteIcon from "@/public/assets/images/nav/quote.svg";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

export default function Quote() {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="border-border flex items-center justify-end gap-2 border-b px-4 py-2.5">
        <Button variant="primary" size="sm">
          <PlusIcon aria-hidden className="size-3" />
          New quote
        </Button>
      </div>
      <SurfacePlaceholder
        icon={QuoteIcon}
        title="Auto-quoter"
        description="The BNG One rate engine — zone and hourly pricing, fees and a full breakdown you can email to the customer."
      />
    </section>
  );
}
