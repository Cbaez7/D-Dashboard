"use client";

import SurfacePlaceholder from "@/components/_common/surface-placeholder";
import MapIcon from "@/public/assets/images/nav/map.svg";

export default function LiveMap() {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <SurfacePlaceholder
        icon={MapIcon}
        title="Fleet map"
        description="Live driver positions, active trips and route planning with ETA — feeding the quoter."
      />
    </section>
  );
}
