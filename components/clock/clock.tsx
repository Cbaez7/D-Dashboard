"use client";

import Button from "@/components/_ui/button";
import SurfacePlaceholder from "@/components/_common/surface-placeholder";
import ClockIcon from "@/public/assets/images/nav/clock.svg";

export default function Clock() {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <SurfacePlaceholder
        icon={ClockIcon}
        title="Time clock"
        description="Clock in and out, see your timesheet — admins review everyone's hours."
      />
      <div className="flex justify-center pb-8">
        <Button variant="primary" size="md">
          Clock in
        </Button>
      </div>
    </section>
  );
}
