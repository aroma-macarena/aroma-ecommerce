import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminSectionProps = {
  id: string;
  title: string;
  /** Only when it says something the title does not. */
  description?: string;
  /** @deprecated Sections are cards now; ignored. */
  ruled?: boolean;
  className?: string;
  children: ReactNode;
};

/** A titled group on an admin page: a white sheet on the squared paper. */
function AdminSection({
  id,
  title,
  description,
  className,
  children,
}: AdminSectionProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn("bg-card rounded-md border p-4 sm:p-6", className)}
    >
      <div className="mb-5 space-y-1">
        <h2 id={id} className="text-lg font-bold">
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground max-w-[65ch] text-sm">
            {description}
          </p>
        ) : null}
      </div>
      <div className="min-w-0 space-y-5">{children}</div>
    </section>
  );
}

export { AdminSection };
