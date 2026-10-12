import { Tags } from "lucide-react";
import type { Metadata } from "next";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getProductFormOptions } from "@/lib/admin/product-mutations";
import { isSuperAdmin } from "@/lib/auth/authorization";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import { createProductAction } from "../actions";

export const metadata: Metadata = {
  title: "Nuevo producto",
};

export default async function NewProductPage() {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const profile = result.currentProfile;
  const { categoryOptions, associationOptions } =
    await getProductFormOptions(profile);
  const choosesAssociation = isSuperAdmin(profile);
  const missing =
    categoryOptions.length === 0
      ? "categorías"
      : choosesAssociation && associationOptions.length === 0
        ? "asociaciones"
        : null;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href="/admin/products">Productos</AdminBackLink>
        <AdminPageHeader
          eyebrow={profile.associationName ?? "Alianza AROMA"}
          title="Nuevo producto"
          description="Se guarda como borrador: no aparece en la vitrina hasta que se publique."
        />
      </div>

      {missing ? (
        <AdminEmptyState
          icon={Tags}
          title={`No hay ${missing} activas`}
          description={`Para crear productos se necesita al menos una ${missing === "categorías" ? "categoría" : "asociación"} activa. La administración de la alianza puede habilitarla.`}
        />
      ) : (
        <ProductForm
          action={createProductAction}
          categoryOptions={categoryOptions}
          associationOptions={
            choosesAssociation ? associationOptions : undefined
          }
          submitLabel="Crear borrador"
          cancelHref="/admin/products"
        />
      )}
    </div>
  );
}
