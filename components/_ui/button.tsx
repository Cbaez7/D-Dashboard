import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium leading-none outline-none select-none transition-[background-color,color,box-shadow] duration-150 ease-power3-out focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[var(--shadow-btn-primary)] hover:bg-[var(--btn-primary-hover)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[var(--shadow-btn-raised)] hover:bg-muted",
        muted:
          "bg-muted text-foreground shadow-[var(--shadow-btn-raised)] hover:bg-[var(--btn-muted-hover)]",
        subtle:
          "bg-[var(--btn-subtle-bg)] text-foreground shadow-[var(--shadow-btn-subtle)] hover:bg-muted",
        ghost: "text-subtle hover:bg-[var(--wash-6)] hover:text-foreground",
        nav: "w-full justify-start rounded-lg text-sidebar-foreground hover:text-foreground data-[active=true]:bg-nav-active data-[active=true]:text-nav-active-foreground data-[active=true]:shadow-[var(--shadow-nav-active)]",
        item: "w-full items-start justify-start gap-3 rounded-lg text-left font-normal whitespace-normal text-foreground hover:bg-[var(--wash-4)]",
        link: "rounded-none text-foreground underline decoration-from-font underline-offset-2 hover:text-soft",
      },
      size: {
        sm: "p-[9px] text-[12px] leading-none",
        md: "p-2 text-[14px] leading-none",
        icon: "size-[30px] p-0",
        "icon-sm": "size-6 p-0",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "sm",
    },
  },
);

type ButtonProps = VariantProps<typeof buttonVariants> &
  ComponentProps<"button"> & {
    href?: ComponentProps<typeof Link>["href"];
  };

export default function Button({
  variant,
  size,
  className,
  href,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(props as Omit<ComponentProps<typeof Link>, "href" | "className">)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
