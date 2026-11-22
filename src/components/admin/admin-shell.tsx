import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { AdminIdentity } from "@/components/admin/admin-identity";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { AdminTabBar } from "@/components/admin/admin-tab-bar";
import { CharacterBudget } from "@/components/admin/character-budget";
import { AromaLogo } from "@/components/brand/aroma-logo";
import type { AdminProfile } from "@/lib/auth/get-current-profile";

type AdminShellProps = {
  profile: AdminProfile;
  children: ReactNode;
};

/**
 * The admin's frame, «Cuaderno de la asociación»: a white side rail on wide
 * screens; on phones a slim top bar and a tab bar within thumb reach.
 */
function AdminShell({ profile, children }: AdminShellProps) {
  const storefrontHref = "/";
  const account = (
    <div className="space-y-3">
      <AdminIdentity profile={profile} />
      <AdminSignOutButton />
    </div>
  );

  return (
    <div className="cuaderno bg-grid-paper text-foreground flex min-h-svh flex-1">
      <a
        href="#admin-contenido"
        className="bg-primary text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-3"
      >
        Saltar al contenido
      </a>
      <aside className="bg-card sticky top-0 hidden h-svh w-60 shrink-0 flex-col overflow-y-auto overscroll-contain border-r lg:flex">
        <div className="px-5 pt-6 pb-5">
          <Link href="/admin" aria-label="Inicio de administración">
            <AromaLogo className="w-32" />
          </Link>
        </div>
        <div className="px-3">
          <AdminNav role={profile.role} />
        </div>
        <div className="mt-auto space-y-3 p-4">
          <a
            href={storefrontHref}
            target="_blank"
            rel="noreferrer"
            className="text-primary inline-flex min-h-11 items-center gap-2 px-1 text-sm font-bold underline-offset-4 hover:underline"
          >
            <ExternalLink aria-hidden className="size-4" />
            Ver la vitrina
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
          {account}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-card sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b px-4 lg:hidden">
          <Link href="/admin" aria-label="Inicio de administración">
            <AromaLogo className="w-24" />
          </Link>
          <p className="text-muted-foreground min-w-0 truncate text-sm">
            {profile.associationName ?? "Alianza AROMA"}
          </p>
        </header>

        <main
          id="admin-contenido"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-4 pt-6 pb-[calc(var(--admin-tabbar-height)+2rem)] wrap-anywhere sm:px-6 md:px-10 md:pt-10 lg:pb-16"
        >
          {children}
        </main>
      </div>

      <CharacterBudget />
      <AdminTabBar
        role={profile.role}
        account={account}
        storefrontHref={storefrontHref}
      />
    </div>
  );
}

export { AdminShell };
