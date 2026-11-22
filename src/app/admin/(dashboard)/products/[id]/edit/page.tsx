import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import {
  getEditableProduct,
  getProductFormOptions,
} from "@/lib/admin/product-mutations";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import { updateProductAction } from "../../actions";

export const metadata: Metadata = {
  title: "Editar producto",
};

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]/edit">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const { id } = await params;
  const profile = result.currentProfile;
  const product = await getEditableProduct(profile, id);

  if (!product) {
    notFound();
  }

  const { categoryOptions } = await getProductFormOptions(
    profile,
    product.categoryId,
  );
  const isDraft = product.status === "DRAFT";
  const productHref = `/admin/products/${product.id}`;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href={productHref}>{product.name}</AdminBackLink>
        <AdminPageHeader
          eyebrow={product.associationName}
          title="Editar información"
          description={
            product.status === "PUBLISHED"
              ? "Está publicado: los cambios se ven en la vitrina al guardar."
              : isDraft
                ? undefined
                : `Su dirección web es fija: /${product.slug}.`
          }
        />
      </div>

      <ProductForm
        action={updateProductAction.bind(null, product.id)}
        defaultValues={{
          name: product.name,
          categoryId: product.categoryId,
          shortDescription: product.shortDescription ?? "",
          description: product.description ?? "",
          origin: product.origin ?? "",
          ingredients: product.ingredients ?? "",
          availabilityNote: product.availabilityNote ?? "",
        }}
        categoryOptions={categoryOptions}
        submitLabel="Guardar cambios"
        cancelHref={productHref}
      />
    </div>
  );
}
