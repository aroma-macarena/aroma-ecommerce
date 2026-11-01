import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ImageUploadForm } from "@/components/admin/image-upload-form";
import { getProductImages } from "@/lib/admin/product-image-mutations";
import { getEditableProduct } from "@/lib/admin/product-mutations";
import getCurrentProfile from "@/lib/auth/get-current-profile";
import { MAX_IMAGES_PER_PRODUCT } from "@/lib/storage/product-images";
import { isMediaStorageConfigured } from "@/lib/storage/r2";

import { uploadProductImageAction } from "../../actions";

export const metadata: Metadata = {
  title: "Nueva imagen",
};

export default async function NewProductImagePage({
  params,
}: PageProps<"/admin/products/[id]/images/new">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const { id } = await params;
  const product = await getEditableProduct(result.currentProfile, id);

  if (!product) {
    notFound();
  }

  const productHref = `/admin/products/${product.id}`;
  const images = await getProductImages(product.id);

  if (images.length >= MAX_IMAGES_PER_PRODUCT) {
    redirect(productHref);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href={productHref}>{product.name}</AdminBackLink>
        <AdminPageHeader
          eyebrow={product.associationName}
          title="Nueva imagen"
          description={
            images.length === 0
              ? `Será la imagen principal de ${product.name}: la que se ve en la vitrina.`
              : `Una foto más de ${product.name}. Se agregará al final; la primera es la principal y puedes cambiar el orden desde la página del producto.`
          }
        />
      </div>

      {isMediaStorageConfigured() ? (
        <ImageUploadForm
          action={uploadProductImageAction.bind(null, product.id)}
          cancelHref={productHref}
        />
      ) : (
        <AdminNotice tone="warning">
          La subida de imágenes aún no está configurada. Avísale a la
          administración de la alianza.
        </AdminNotice>
      )}
    </div>
  );
}
