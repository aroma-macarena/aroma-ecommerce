import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PresentationForm } from "@/components/admin/presentation-form";
import { getEditableProduct } from "@/lib/admin/product-mutations";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import { createPresentationAction } from "../../actions";

export const metadata: Metadata = {
  title: "Nueva presentación",
};

export default async function NewPresentationPage({
  params,
}: PageProps<"/admin/products/[id]/presentations/new">) {
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

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href={productHref}>{product.name}</AdminBackLink>
        <AdminPageHeader
          eyebrow={product.associationName}
          title="Nueva presentación"
        />
      </div>

      <section className="bg-card rounded-md border p-4 sm:p-6">
        <PresentationForm
          action={createPresentationAction.bind(null, product.id)}
          submitLabel="Agregar presentación"
          cancelHref={productHref}
        />
      </section>
    </div>
  );
}
