import { Info } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { StatusBadge } from "@/components/admin/status-badge";
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

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href="/admin/products">Productos</AdminBackLink>
        <AdminPageHeader
          eyebrow={product.associationName}
          title={product.name}
          description="Edita la información del producto. La asociación no se puede cambiar."
          actions={<StatusBadge status={product.status} />}
        />
      </div>

      <dl className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-sm">
        <dt className="font-mono text-xs tracking-[0.06em] uppercase">
          Identificador web
        </dt>
        <dd className="text-foreground font-mono text-xs break-all">
          {product.slug}
        </dd>
        <dd className="w-full">
          {isDraft
            ? "Se actualiza con el nombre mientras el producto sea borrador."
            : "Queda fija desde que el producto se publicó, para no romper enlaces."}
        </dd>
      </dl>

      {product.status === "PUBLISHED" ? (
        <p className="border-brand-orange bg-card flex items-start gap-2 border-l-[3px] px-4 py-3 text-sm font-medium">
          <Info
            aria-hidden
            className="text-brand-orange mt-0.5 size-4 shrink-0"
          />
          Este producto está publicado: los cambios se verán en la vitrina al
          guardar.
        </p>
      ) : null}

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
        cancelHref="/admin/products"
      />
    </div>
  );
}
