import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { isSuperAdmin } from "@/lib/auth/authorization";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import { createCategoryAction } from "../actions";

export const metadata: Metadata = {
  title: "Nueva categoría",
};

export default async function NewCategoryPage() {
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
        <AdminBackLink href="/admin/categories">Categorías</AdminBackLink>
        <AdminPageHeader
          eyebrow="Alianza AROMA"
          title="Nueva categoría"
          description="Se crea activa: las asociaciones podrán elegirla para sus productos y aparecerá en el filtro de la vitrina cuando tenga productos publicados."
        />
      </div>

      <CategoryForm
        action={createCategoryAction}
        cancelHref="/admin/categories"
        submitLabel="Crear categoría"
      />
    </div>
  );
}
