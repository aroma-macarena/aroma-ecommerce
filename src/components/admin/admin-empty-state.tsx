import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type AdminEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

/** Placeholder for a list with no items: a dashed slot instead of a row. */
function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="bg-card/60 flex flex-col gap-4 rounded-lg border border-dashed px-5 py-6 sm:flex-row sm:items-start">
      <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          {description}
        </p>
        {action ? <div className="pt-3">{action}</div> : null}
      </div>
    </div>
  );
}

export { AdminEmptyState };
