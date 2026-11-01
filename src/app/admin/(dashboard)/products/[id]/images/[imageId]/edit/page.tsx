import { Star } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ImageAltTextForm } from "@/components/admin/image-alt-text-form";
import { ProductImagePreview } from "@/components/admin/product-image-preview";
import { SubmitButton } from "@/components/admin/submit-button";
import { getEditableImage } from "@/lib/admin/product-image-mutations";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import {
  deleteProductImageAction,
  setPrimaryImageAction,
  updateImageAltTextAction,
} from "../../../actions";

export const metadata: Metadata = {
  title: "Editar imagen",
};

export default async function EditProductImagePage({
  params,
}: PageProps<"/admin/products/[id]/images/[imageId]/edit">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const { id, imageId } = await params;
  const editable = await getEditableImage(result.currentProfile, id, imageId);

  if (!editable) {
    notFound();
  }

  const { product, image } = editable;
  const productHref = `/admin/products/${product.id}`;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href={productHref}>{product.name}</AdminBackLink>
        <AdminPageHeader
          eyebrow={product.associationName}
          title="Editar imagen"
          description={`Imagen de ${product.name}.`}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-[14rem_minmax(0,1fr)] sm:items-start sm:gap-8">
        <ProductImagePreview
          objectKey={image.objectKey}
          alt={image.altText ?? product.name}
          sizes="(min-width: 640px) 14rem, 100vw"
          className="max-w-xs sm:max-w-none"
        />
        <div className="space-y-3">
          {image.isPrimary ? (
            <p className="flex items-start gap-2 text-sm">
              <Star
                aria-hidden
                className="fill-brand-orange text-brand-orange mt-0.5 size-4 shrink-0"
              />
              <span>
                <span className="font-semibold">Imagen principal.</span> Es la
                que se ve en la vitrina.
              </span>
            </p>
          ) : (
            <form
              action={setPrimaryImageAction.bind(null, product.id, image.id)}
              className="space-y-2"
            >
              <SubmitButton variant="outline" pendingLabel="Guardando…">
                <Star aria-hidden />
                Usar como principal
              </SubmitButton>
              <p className="text-muted-foreground text-sm">
                Pasará al primer lugar: la principal es la que se ve en la
                vitrina.
              </p>
            </form>
          )}
        </div>
      </div>

      <ImageAltTextForm
        action={updateImageAltTextAction.bind(null, product.id, image.id)}
        defaultAltText={image.altText ?? ""}
        cancelHref={productHref}
        secondaryAction={
          <ConfirmDeleteButton
            label="Eliminar imagen"
            title="¿Eliminar esta imagen?"
            description={
              image.isPrimary
                ? "Se borrará de forma definitiva. Como es la principal, la siguiente imagen pasará a ocupar su lugar."
                : "Se borrará de forma definitiva."
            }
            action={deleteProductImageAction.bind(null, product.id, image.id)}
          />
        }
      />
    </div>
  );
}
