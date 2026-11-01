import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ActiveStatusBadge } from "@/components/admin/status-badge";
import { getAssociationProfile } from "@/lib/admin/association-profile";
import { isSuperAdmin } from "@/lib/auth/authorization";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import { AssociationProfileEditor } from "../../association-profile-editor";

export const metadata: Metadata = {
  title: "Editar asociación",
};

export default async function EditAssociationPage({
  params,
  searchParams,
}: PageProps<"/admin/associations/[id]/edit">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  // Alliance-level page: association administrators use their own page.
  if (!isSuperAdmin(result.currentProfile)) {
    notFound();
  }

  const association = await getAssociationProfile(
    result.currentProfile,
    (await params).id,
  );

  if (!association) {
    notFound();
  }

  const { estado, aviso } = await searchParams;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href="/admin/associations">Asociaciones</AdminBackLink>
        <AdminPageHeader
          eyebrow="Alianza AROMA"
          title={association.name}
          description="Edita su perfil público: nombre, información, contacto, logo y portada."
          actions={<ActiveStatusBadge status={association.status} />}
        />
      </div>

      <AssociationProfileEditor
        association={association}
        canEditName
        cancelHref="/admin/associations"
        estado={estado}
        aviso={aviso}
      />
    </div>
  );
}
