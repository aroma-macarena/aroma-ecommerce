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
    <div className="bg-muted/40 flex min-h-svh flex-1">
      <aside className="bg-background sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r md:flex">
        <div className="px-6 py-6">
          <Link href="/admin" aria-label="Inicio de administración">
            <AromaLogo className="w-40" sizes="160px" />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <AdminNav role={profile.role} />
        </div>

        <div className="p-4">{sessionPanel}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background sticky top-0 z-40 flex h-16 items-center gap-3 border-b px-4 md:hidden">
          <AdminMobileNav role={profile.role} footer={sessionPanel} />
          <Link href="/admin" aria-label="Inicio de administración">
            <AromaLogo className="w-28" sizes="112px" />
          </Link>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export { AdminShell };
