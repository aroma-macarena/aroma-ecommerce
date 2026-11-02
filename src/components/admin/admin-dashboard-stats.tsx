import Link from "next/link";

import { cn } from "@/lib/utils";

export type DashboardStat = {
  label: string;
  value: number;
  /** A short note under the label, such as "de 5". */
  note?: string;
  href: string;
};

/**
 * A row of counts, each one a link to the section it summarizes. Same
 * ruled strip as the storefront facts, in the admin's scale.
 */
function AdminDashboardStats({
  stats,
  label,
}: {
  stats: DashboardStat[];
  label: string;
}) {
  return (
    <ul
      aria-label={label}
      className={cn(
        "border-foreground grid border-t-[1.5px] border-b",
        stats.length === 3 ? "grid-cols-3" : "grid-cols-2",
      )}
    >
      {stats.map((stat) => (
        <li key={stat.label} className="min-w-0 border-l first:border-l-0">
          <Link
            href={stat.href}
            className="hover:bg-muted/60 focus-visible:outline-ring flex h-full flex-col gap-1 px-3 py-3 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 sm:px-5"
          >
            <span className="font-heading text-3xl leading-none font-semibold md:text-4xl">
              {stat.value}
            </span>
            <span className="text-muted-foreground text-sm leading-snug">
              {stat.label}
              {stat.note ? (
                <span className="block font-mono text-xs">{stat.note}</span>
              ) : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export { AdminDashboardStats };
