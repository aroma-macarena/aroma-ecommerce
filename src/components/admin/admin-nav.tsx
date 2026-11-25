"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  getAdminNavigation,
  isActiveAdminPath,
} from "@/components/admin/admin-navigation";
import type { AdminRole } from "@/lib/auth/get-current-profile";
import { cn } from "@/lib/utils";

type AdminNavProps = {
  role: AdminRole;
};

/** The side rail's destinations, on screens wide enough to keep it open. */
function AdminNav({ role }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación administrativa">
      <ul className="space-y-0.5">
        {getAdminNavigation(role).map(({ href, label, icon: Icon }) => {
          const isActive = isActivePath(pathname, href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-md px-3 text-[0.9375rem] transition-colors duration-150",
                  isActive
                    ? "bg-accent text-accent-foreground font-bold"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <Icon
                  aria-hidden
                  className={cn(
                    "size-5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const isActivePath = isActiveAdminPath;

export { AdminNav };
