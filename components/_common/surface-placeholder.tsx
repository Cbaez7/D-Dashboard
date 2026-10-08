import type { ComponentType, SVGProps } from "react";

type SurfacePlaceholderProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

export default function SurfacePlaceholder({
  icon: Icon,
  title,
  description,
}: SurfacePlaceholderProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <span className="bg-muted flex size-12 items-center justify-center rounded-full shadow-[0px_0px_0px_1px_#232323]">
        <Icon aria-hidden className="text-soft size-5" />
      </span>
      <span className="lead-style mt-2 block font-medium">{title}</span>
      <span className="caption-style text-subtle block max-w-64">
        {description}
      </span>
    </div>
  );
}
