import { Building2, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminAssociationList } from "@/components/admin/admin-association-list";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { buttonVariants } from "@/components/ui/button";
import { getAdminAssociations } from "@/lib/admin/associations";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import { setAssociationStatusAction } from "./actions";

export const metadata: Metadata = {
  title: "Asociaciones",
};

const confirmations: Record<string, string> = {
  creada: "Asociación creada. Ya aparece en el directorio público.",
  actualizada: "Cambios guardados.",
  activada: "Asociación activada.",
  desactivada: "Asociación desactivada. Sus datos se conservan.",
};

export default async function AdminAssociationsPage({
  searchParams,
}: PageProps<"/admin/associations">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const associations = await getAdminAssociations(result.currentProfile);

  // Alliance-level management: association administrators do not see it.
  if (!associations) {
    notFound();
  }

  const { estado } = await searchParams;
  const confirmation =
    typeof estado === "string" ? confirmations[estado] : undefined;
  const newAssociationLink = (
    <Link
      href="/admin/associations/new"
      className={buttonVariants({ className: "w-full md:w-auto" })}
    >
      <Plus aria-hidden />
      Nueva asociación
    </Link>
  );

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Alianza AROMA"
        title="Asociaciones"
        description="Crea asociaciones y activa o desactiva su participación. Desactivar oculta su perfil y sus productos y bloquea a sus administradoras, sin borrar nada."
        actions={newAssociationLink}
      />

      {confirmation ? (
        <AdminNotice tone="success">{confirmation}</AdminNotice>
      ) : null}

      {associations.length > 0 ? (
        <AdminAssociationList
          associations={associations}
          setStatusAction={(associationId, status) =>
            setAssociationStatusAction.bind(null, associationId, status)
          }
        />
      ) : (
        <AdminEmptyState
          icon={Building2}
          title="Aún no hay asociaciones"
          description="Crea la primera para que sus administradoras puedan publicar productos."
        />
      )}
    </div>
  );
}
