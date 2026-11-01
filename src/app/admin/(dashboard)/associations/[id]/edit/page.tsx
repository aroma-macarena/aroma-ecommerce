import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AssociationForm } from "@/components/admin/association-form";
import { AssociationStatusBadge } from "@/components/admin/status-badge";
import { getEditableAssociation } from "@/lib/admin/associations";
import getCurrentProfile from "@/lib/auth/get-current-profile";
import { getAssociationHref } from "@/lib/public-routes";

import { updateAssociationAction } from "../../actions";

export const metadata: Metadata = {
  title: "Editar asociación",
};

export default async function EditAssociationPage({
  params,
}: PageProps<"/admin/associations/[id]/edit">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const association = await getEditableAssociation(
    result.currentProfile,
    (await params).id,
  );

  // Missing, or not a super administrator.
  if (!association) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href="/admin/associations">Asociaciones</AdminBackLink>
        <AdminPageHeader
          eyebrow="Alianza AROMA"
          title={association.name}
          description="Cambia el nombre o la ubicación. Se actualizan en el panel, la vitrina, el directorio y los mensajes de WhatsApp."
          actions={<AssociationStatusBadge status={association.status} />}
        />
      </div>

      <dl className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-sm">
        <dt className="font-mono text-xs tracking-[0.06em] uppercase">
          Dirección pública
        </dt>
        <dd className="text-foreground font-mono text-xs break-all">
          {getAssociationHref(association.slug)}
        </dd>
        <dd className="w-full">
          No cambia al renombrarla, para no romper los enlaces ya compartidos.
        </dd>
      </dl>

      <AssociationForm
        action={updateAssociationAction.bind(null, association.id)}
        cancelHref="/admin/associations"
        submitLabel="Guardar cambios"
        defaultValues={{
          name: association.name,
          location: association.location ?? "",
        }}
      />
    </div>
  );
}
