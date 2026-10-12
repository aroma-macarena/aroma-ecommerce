import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminSectionProps = {
  id: string;
  title: string;
  description?: string;
  /** Keep the top rule even when it is the page's first section. */
  ruled?: boolean;
  children: ReactNode;
};

/**
 * A titled group on an admin page: title and purpose on the left on desktop,
 * above on mobile. The first one rests on the page header's rule.
 */
function AdminSection({
  id,
  title,
  description,
  ruled = false,
  children,
}: AdminSectionProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "border-foreground grid gap-5 border-t pt-5 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10",
        !ruled && "first-of-type:border-t-0 first-of-type:pt-0",
      )}
    >
      <div className="space-y-1">
        <h2
          id={id}
          className="font-heading text-xl font-semibold tracking-[-0.015em]"
        >
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground text-sm leading-6">
            {description}
          </p>
        ) : null}
      </div>
      <div className="min-w-0 space-y-5">{children}</div>
    </section>
  );
}

export { AdminSection };
