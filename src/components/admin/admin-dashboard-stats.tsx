import Link from "next/link";

import { cn } from "@/lib/utils";

export type DashboardStat = {
  label: string;
  value: number;
  /** A short note beside the value, such as "de 8". */
  note?: string;
  href: string;
};

/**
 * A row of counts in blue ink, each one a link to what it counts. A zero
 * goes grey: nothing to look at there.
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
        "bg-card grid overflow-hidden rounded-md border",
        stats.length === 3 ? "grid-cols-3" : "grid-cols-2",
      )}
    >
      {stats.map((stat) => (
        <li key={stat.label} className="min-w-0 border-l first:border-l-0">
          <Link
            href={stat.href}
            className="hover:bg-accent/60 focus-visible:outline-ring flex h-full flex-col gap-1 px-3 py-3 transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 sm:px-4"
          >
            <span className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-[1.75rem] leading-none font-bold",
                  stat.value === 0 ? "text-muted-foreground" : "text-primary",
                )}
              >
                {stat.value}
              </span>
              {stat.note ? (
                <span className="text-muted-foreground text-sm">
                  {stat.note}
                </span>
              ) : null}
            </span>
            <span className="text-muted-foreground text-sm leading-snug">
              {stat.label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export { AdminDashboardStats };
