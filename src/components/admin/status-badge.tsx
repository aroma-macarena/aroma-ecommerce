import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ProductStatus = "DRAFT" | "PUBLISHED" | "PAUSED";

const statuses: Record<
  ProductStatus,
  { label: string; className: string; marker: ReactNode }
> = {
  PUBLISHED: {
    label: "Publicado",
    className: "text-foreground bg-muted",
    marker: <circle cx="4" cy="4" r="4" className="fill-foreground" />,
  },
  DRAFT: {
    label: "Borrador",
    className: "text-foreground bg-card border",
    marker: (
      <circle
        cx="4"
        cy="4"
        r="3.25"
        fill="none"
        strokeWidth="1.5"
        className="stroke-foreground"
      />
    ),
  },
  PAUSED: {
    label: "Pausado",
    className: "text-muted-foreground bg-muted",
    marker: (
      <>
        <rect x="1" width="2" height="8" className="fill-muted-foreground" />
        <rect x="5" width="2" height="8" className="fill-muted-foreground" />
      </>
    ),
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
        "inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-[0.8125rem] font-bold whitespace-nowrap",
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

const activeStatuses: Record<
  "ACTIVE" | "INACTIVE",
  { label: string; className: string; marker: ReactNode }
> = {
  ACTIVE: {
    label: "Activa",
    className: "text-foreground bg-muted",
    marker: <circle cx="4" cy="4" r="4" className="fill-foreground" />,
  },
  INACTIVE: {
    label: "Inactiva",
    className: "text-muted-foreground bg-muted",
    marker: (
      <rect
        x="0.75"
        y="0.75"
        width="6.5"
        height="6.5"
        fill="none"
        strokeWidth="1.5"
        className="stroke-muted-foreground"
      />
    ),
  },
};

/** Active or inactive (associations, categories), same shape-and-label rule. */
function ActiveStatusBadge({
  status,
  className,
}: {
  status: "ACTIVE" | "INACTIVE";
  className?: string;
}) {
  const { label, className: toneClassName, marker } = activeStatuses[status];

  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-[0.8125rem] font-bold whitespace-nowrap",
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

export { ActiveStatusBadge, StatusBadge };
export type { ProductStatus };
