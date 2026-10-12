import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { buttonVariants } from "@/components/ui/button";
import getCurrentProfile from "@/lib/auth/get-current-profile";
import { publicRoutes } from "@/lib/public-routes";

export default async function AdminPage() {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const { name, associationName } = result.currentProfile;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow={associationName ?? "Alianza AROMA"}
        title={`Hola, ${name}`}
        description={
          associationName
            ? `Desde este panel podrás gestionar la información y los productos de ${associationName}.`
            : "Desde este panel podrás gestionar las asociaciones, categorías, productos y contenidos de AROMA."
        }
      />
      <section className="max-w-2xl space-y-4" aria-labelledby="estado-admin">
        <h2
          id="estado-admin"
          className="font-heading text-xl font-semibold tracking-[-0.015em]"
        >
          La vitrina ya está disponible
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Puedes consultar los productos publicados en el sitio público. Las
          herramientas para gestionar el contenido están en preparación y
          aparecerán en este menú cuando estén disponibles.
        </p>
        <Link
          href={publicRoutes.products}
          className={buttonVariants({ variant: "outline" })}
        >
          Ver vitrina comercial
        </Link>
      </section>
    </div>
  );
}
