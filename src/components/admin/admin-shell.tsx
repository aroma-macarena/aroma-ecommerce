import Link from "next/link";
import type { ReactNode } from "react";

import { AdminIdentity } from "@/components/admin/admin-identity";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { AromaLogo } from "@/components/brand/aroma-logo";
import type { AdminProfile } from "@/lib/auth/get-current-profile";

type AdminShellProps = {
  profile: AdminProfile;
  children: ReactNode;
};

function AdminShell({ profile, children }: AdminShellProps) {
  const sessionPanel = (
    <div className="space-y-3">
      <AdminIdentity profile={profile} />
      <AdminSignOutButton />
    </div>
  );

  return (
    <div className="bg-background flex min-h-svh flex-1">
      <a
        href="#admin-contenido"
        className="bg-primary text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:max-w-[calc(100%-2rem)] focus:rounded-md focus:px-4 focus:py-3"
      >
        Saltar al contenido
      </a>
      <aside className="bg-card sticky top-0 hidden h-svh w-64 shrink-0 flex-col overflow-y-auto overscroll-contain border-r md:flex">
        <div className="px-6 py-6">
          <Link
            href="/admin"
            aria-label="Inicio de administración"
            className="min-w-0"
          >
            <AromaLogo className="w-40" />
          </Link>
        </div>

        <div className="px-4">
          <AdminNav role={profile.role} />
        </div>

        <div className="mt-auto p-4">{sessionPanel}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background sticky top-0 z-40 flex min-h-16 items-center gap-3 border-b px-4 py-2 md:hidden">
          <AdminMobileNav role={profile.role} footer={sessionPanel} />
          <Link
            href="/admin"
            aria-label="Inicio de administración"
            className="min-w-0"
          >
            <AromaLogo className="w-28" />
          </Link>
        </header>

        <main
          id="admin-contenido"
          tabIndex={-1}
          className="min-w-0 flex-1 px-4 py-6 wrap-anywhere sm:px-6 md:px-8 md:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export { AdminShell };
