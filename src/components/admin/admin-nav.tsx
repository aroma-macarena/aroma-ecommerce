"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getAdminNavigation } from "@/components/admin/admin-navigation";
import type { AdminRole } from "@/lib/auth/get-current-profile";
import { cn } from "@/lib/utils";

type AdminNavProps = {
  role: AdminRole;
  onNavigate?: () => void;
};

function isActivePath(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNav({ role, onNavigate }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación administrativa">
      <ul className="space-y-1">
        {getAdminNavigation(role).map(
          ({ href, label, icon: Icon, available }) => {
            const itemClassName =
              "flex h-10 items-center gap-3 rounded-2xl px-3 text-sm font-medium";

            if (!available) {
              return (
                <li key={href}>
                  <span
                    aria-disabled="true"
                    className={cn(itemClassName, "text-muted-foreground/70")}
                  >
                    <Icon className="size-4" />
                    {label}
                    <span className="ml-auto text-xs font-normal">Pronto</span>
                  </span>
                </li>
              );
            }

            const isActive = isActivePath(pathname, href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    itemClassName,
                    "focus-visible:ring-ring/30 transition-colors outline-none focus-visible:ring-3",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              </li>
            );
          },
        )}
      </ul>
    </nav>
  );
}

export { AdminNav };
