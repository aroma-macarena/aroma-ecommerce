"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { publicNavigation, publicRoutes } from "@/lib/public-routes";
import { cn } from "@/lib/utils";

function useVisibleSectionId(enabled: boolean) {
  const [visibleSectionId, setVisibleSectionId] = useState<string>();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const sections = publicNavigation.flatMap(({ href }) => {
      const id = href.split("#")[1];
      const element = id ? document.getElementById(id) : null;
      return element ? [element] : [];
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setVisibleSectionId((current) =>
            entry.isIntersecting
              ? entry.target.id
              : current === entry.target.id
                ? undefined
                : current,
          );
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [enabled]);

  return enabled ? visibleSectionId : undefined;
}

function PublicNav() {
  const pathname = usePathname();
  const visibleSectionId = useVisibleSectionId(pathname === publicRoutes.home);

  return (
    <nav aria-label="Navegación principal" className="max-w-full">
      <ul className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
        {publicNavigation.map(({ href, label, available }) => {
          const [path, sectionId] = href.split("#");
          const isActive = sectionId
            ? pathname === (path || "/") && visibleSectionId === sectionId
            : !visibleSectionId &&
              (pathname === href ||
                (href !== "/" && pathname.startsWith(`${href}/`)));
          return (
            <li key={href} className="max-w-full">
              {available ? (
                <Link
                  href={href}
                  aria-current={
                    isActive ? (sectionId ? "location" : "page") : undefined
                  }
                  className={cn(
                    "inline-flex min-h-11 max-w-full items-center px-2 py-2 text-[0.9375rem] wrap-anywhere transition-colors focus-visible:outline-offset-[-2px] sm:px-3",
                    isActive
                      ? "text-foreground shadow-[inset_0_-3px_0_var(--brand-orange)] font-semibold"
                      : "text-muted-foreground hover:text-foreground font-medium",
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
