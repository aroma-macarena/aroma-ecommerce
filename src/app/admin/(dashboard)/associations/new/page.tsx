import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AssociationForm } from "@/components/admin/association-form";
import { isSuperAdmin } from "@/lib/auth/authorization";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import { createAssociationAction } from "../actions";

export const metadata: Metadata = {
  title: "Nueva asociación",
};

export default async function NewAssociationPage() {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  if (!isSuperAdmin(result.currentProfile)) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href="/admin/associations">Asociaciones</AdminBackLink>
        <AdminPageHeader
          eyebrow="Alianza AROMA"
          title="Nueva asociación"
          description="Se crea activa y aparece en el directorio público. Su descripción, historia, contacto y logo se completan después."
        />
      </div>

      <AssociationForm
        action={createAssociationAction}
        cancelHref="/admin/associations"
      />
    </div>
  );
}
