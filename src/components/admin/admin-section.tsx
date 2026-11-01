import type { ReactNode } from "react";

type AdminSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
};

/**
 * A titled group on an admin page: title and purpose on the left on desktop,
 * above on mobile. The first one rests on the page header's rule.
 */
function AdminSection({ id, title, description, children }: AdminSectionProps) {
  return (
    <section
      aria-labelledby={id}
      className="border-foreground grid gap-5 border-t pt-5 first-of-type:border-t-0 first-of-type:pt-0 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10"
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
