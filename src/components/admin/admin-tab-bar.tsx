"use client";

import { Ellipsis, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

import {
  ADMIN_TAB_COUNT,
  getAdminNavigation,
  isActiveAdminPath,
} from "@/components/admin/admin-navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AdminRole } from "@/lib/auth/get-current-profile";
import { cn } from "@/lib/utils";

type AdminTabBarProps = {
  role: AdminRole;
  /** Who is signed in and the sign-out button, shown under «Más». */
  account: ReactNode;
  storefrontHref: string;
};

const tabClassName =
  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-xs leading-none transition-colors duration-150";

/**
 * Phones: the main destinations as a tab bar within thumb reach; the rest,
 * the account and the storefront link under «Más».
 */
function AdminTabBar({ role, account, storefrontHref }: AdminTabBarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = getAdminNavigation(role);
  const tabs = items.slice(0, ADMIN_TAB_COUNT);
  const more = items.slice(ADMIN_TAB_COUNT);
  const moreIsActive = more.some(({ href }) =>
    isActiveAdminPath(pathname, href),
  );

  // A form is one job: its own back link and save bar take the screen.
  if (/\/(new|edit)$/.test(pathname)) {
    return null;
  }

  return (
    <nav
      data-admin-tabbar
      aria-label="Navegación administrativa"
      className="bg-card fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-4">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = isActiveAdminPath(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  tabClassName,
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon aria-hidden className="size-6" />
                {label}
              </Link>
            </li>
          );
        })}
        <li>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                tabClassName,
                "w-full",
                moreIsActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Ellipsis aria-hidden className="size-6" />
              Más
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="cuaderno max-h-[85svh] overflow-y-auto rounded-t-xl pb-[env(safe-area-inset-bottom)]"
            >
              <SheetHeader className="p-4 pb-2">
                <SheetTitle className="text-base font-bold">Más</SheetTitle>
                <SheetDescription className="sr-only">
                  Otras secciones del panel y tu cuenta.
                </SheetDescription>
              </SheetHeader>
              <ul className="px-2">
                {more.map(({ href, label, icon: Icon }) => {
                  const isActive = isActiveAdminPath(pathname, href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center gap-3 rounded-md px-3 text-base",
                          isActive
                            ? "bg-accent text-accent-foreground font-bold"
                            : "hover:bg-muted",
                        )}
                      >
                        <Icon aria-hidden className="text-primary size-5" />
                        {label}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <a
                    href={storefrontHref}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:bg-muted flex min-h-12 items-center gap-3 rounded-md px-3 text-base"
                  >
                    <ExternalLink aria-hidden className="text-primary size-5" />
                    Ver la vitrina
                    <span className="sr-only">(se abre en otra pestaña)</span>
                  </a>
                </li>
              </ul>
              <div className="p-4 pt-2">{account}</div>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}

export { AdminTabBar };
