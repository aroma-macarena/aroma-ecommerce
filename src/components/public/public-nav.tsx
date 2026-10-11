"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { publicNavigation } from "@/lib/public-routes";
import { cn } from "@/lib/utils";

function PublicNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="max-w-full">
      <ul className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
        {publicNavigation.map(({ href, label, available }) => {
          const isActive =
            !href.includes("#") &&
            (pathname === href ||
              (href !== "/" && pathname.startsWith(`${href}/`)));
          return (
            <li key={href} className="max-w-full">
              {available ? (
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 max-w-full items-center rounded-md px-3 py-2 text-sm font-medium wrap-anywhere transition-colors hover:bg-muted",
                    isActive && "bg-secondary text-primary",
                  )}
                >
                  {label}
                </Link>
              ) : (
                <span
                  className="text-muted-foreground flex min-h-11 flex-col justify-center px-1 text-sm"
                  aria-disabled="true"
                >
                  {label}
                  <span className="text-xs leading-4">Próximamente</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { PublicNav };
