import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ProductStatus = "DRAFT" | "PUBLISHED" | "PAUSED";

const statuses: Record<
  ProductStatus,
  { label: string; className: string; marker: ReactNode }
> = {
  PUBLISHED: {
    label: "Publicado",
    className: "text-primary",
    marker: <circle cx="4" cy="4" r="4" className="fill-primary" />,
  },
  DRAFT: {
    label: "Borrador",
    className: "text-muted-foreground",
    marker: (
      <circle
        cx="4"
        cy="4"
        r="3.25"
        fill="none"
        strokeWidth="1.5"
        className="stroke-muted-foreground"
      />
    ),
  },
  PAUSED: {
    label: "Pausado",
    className: "text-foreground",
    marker: <rect width="8" height="8" className="fill-brand-orange" />,
  },
};

type StatusBadgeProps = {
  status: ProductStatus;
  className?: string;
};

/** Product status shown with a shape and a label, never by color alone. */
function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: toneClassName, marker } = statuses[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs font-medium whitespace-nowrap",
        toneClassName,
        className,
      )}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
        {marker}
      </svg>
      {label}
    </span>
  );
}

export { StatusBadge };
export type { ProductStatus };
