import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { PresentationForm } from "@/components/admin/presentation-form";
import { toPresentationFormValues } from "@/lib/admin/presentation-form";
import {
  getEditablePresentation,
  lastAvailableMessage,
} from "@/lib/admin/presentation-mutations";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import {
  deletePresentationAction,
  updatePresentationAction,
} from "../../../actions";

export const metadata: Metadata = {
  title: "Editar presentación",
};

export default async function EditPresentationPage({
  params,
}: PageProps<"/admin/products/[id]/presentations/[presentationId]/edit">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const { id, presentationId } = await params;
  const editable = await getEditablePresentation(
    result.currentProfile,
    id,
    presentationId,
  );

  if (!editable) {
    notFound();
  }

  const { product, presentation, isLastAvailable } = editable;
  const productHref = `/admin/products/${product.id}`;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href={productHref}>{product.name}</AdminBackLink>
        <AdminPageHeader
          eyebrow={product.associationName}
          title={presentation.name}
          description={`Presentación de ${product.name}.`}
        />
      </div>

      <PresentationForm
        action={updatePresentationAction.bind(
          null,
          product.id,
          presentation.id,
        )}
        defaultValues={toPresentationFormValues(presentation)}
        submitLabel="Guardar cambios"
        cancelHref={productHref}
      />

      <AdminSection
        id="eliminar"
        ruled
        title="Eliminar"
        description="Quita la presentación del producto de forma definitiva."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <ConfirmDeleteButton
            label="Eliminar presentación"
            title={`¿Eliminar «${presentation.name}»?`}
            description="La presentación se borrará de forma definitiva. Si solo quieres dejar de ofrecerla por un tiempo, márcala como no disponible."
            action={deletePresentationAction.bind(
              null,
              product.id,
              presentation.id,
            )}
            disabled={isLastAvailable}
            aria-describedby={isLastAvailable ? "eliminar-nota" : undefined}
          />
          {isLastAvailable ? (
            <p id="eliminar-nota" className="text-muted-foreground text-sm">
              {lastAvailableMessage}
            </p>
          ) : null}
        </div>
      </AdminSection>
    </div>
  );
}
