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
    <div className="bg-card/60 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 rounded-lg sm:items-start sm:gap-y-1 border border-dashed px-5 py-6">
      <span className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-md sm:row-span-2">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="font-semibold sm:pt-0.5">{title}</p>
      <p className="text-muted-foreground col-span-2 text-sm leading-relaxed sm:col-span-1 sm:col-start-2">
        {description}
      </p>
      {action ? (
        <div className="col-span-2 pt-2 sm:col-span-1 sm:col-start-2">
          {action}
        </div>
      ) : null}
    </div>
  );
}

export { AdminEmptyState };
