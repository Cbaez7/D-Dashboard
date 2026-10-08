"use client";

import SurfacePlaceholder from "@/components/_common/surface-placeholder";
import GuideIcon from "@/public/assets/images/nav/guide.svg";

export default function Guide() {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <SurfacePlaceholder
        icon={GuideIcon}
        title="Guide"
        description="SOPs and playbooks — searchable, categorized, editable by admins."
      />
    </section>
  );
}
