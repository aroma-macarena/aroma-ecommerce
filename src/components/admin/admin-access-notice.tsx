import Link from "next/link";

import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { AromaLogo } from "@/components/brand/aroma-logo";
import { publicRoutes } from "@/lib/public-routes";

type AdminAccessNoticeProps = {
  title: string;
  description: string;
};

function AdminAccessNotice({ title, description }: AdminAccessNoticeProps) {
  return (
    <main className="bg-background flex min-h-svh flex-1 items-center justify-center px-5 py-12">
      <div className="bg-card w-full max-w-md space-y-6 rounded-lg border p-6">
        <AromaLogo variant="symbol" className="w-14" />
        <div className="space-y-2">
          <h1 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em]">
            {title}
          </h1>
          <p className="text-muted-foreground leading-7">{description}</p>
          <p className="text-muted-foreground leading-7">
            Si crees que es un error, comunícate con la administración de la
            Alianza AROMA.
          </p>
        </div>
        <div className="space-y-2">
          <AdminSignOutButton />
          <Link
            href={publicRoutes.home}
            className="text-muted-foreground hover:text-primary flex min-h-11 items-center justify-center rounded-md text-sm underline underline-offset-4"
          >
            Volver al sitio público
          </Link>
        </div>
      </div>
    </main>
  );
}

export { AdminAccessNotice };
