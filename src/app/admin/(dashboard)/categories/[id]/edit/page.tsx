import { Pause } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ActiveStatusBadge } from "@/components/admin/status-badge";
import { getEditableCategory } from "@/lib/admin/categories";
import getCurrentProfile from "@/lib/auth/get-current-profile";
import { getProductsByCategoryHref } from "@/lib/public-routes";

import {
  deleteCategoryAction,
  setCategoryActiveAction,
  updateCategoryAction,
} from "../../actions";

export const metadata: Metadata = {
  title: "Editar categoría",
};

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/categories/[id]/edit">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const category = await getEditableCategory(
    result.currentProfile,
    (await params).id,
  );

  // Missing, or not a super administrator.
  if (!category) {
    notFound();
  }

  const inUse = category.productCount > 0;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href="/admin/categories">Categorías</AdminBackLink>
        <AdminPageHeader
          eyebrow="Alianza AROMA"
          title={category.name}
          description="Los productos conservan la categoría con el nombre nuevo."
          actions={
            <ActiveStatusBadge
              status={category.isActive ? "ACTIVE" : "INACTIVE"}
            />
          }
        />
      </div>

      <dl className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-sm">
        <dt className="text-sm">Dirección en el filtro</dt>
        <dd className="text-foreground text-sm break-all">
          {getProductsByCategoryHref(category.slug)}
        </dd>
        <dd className="w-full">
          No cambia al renombrarla, para no romper los enlaces ya compartidos.
        </dd>
      </dl>

      <section className="bg-card rounded-md border p-4 sm:p-6">
        <CategoryForm
          action={updateCategoryAction.bind(null, category.id)}
          cancelHref="/admin/categories"
          submitLabel="Guardar cambios"
          defaultValues={{
            name: category.name,
            description: category.description ?? "",
          }}
          secondaryAction={
            inUse ? (
              // Deleting needs no product using it: say why here, beside the
              // alternative, instead of a disabled red button.
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <p className="text-muted-foreground text-sm">
                  No se puede eliminar:{" "}
                  {category.productCount === 1
                    ? "1 producto la usa"
                    : `${category.productCount} productos la usan`}
                  .
                </p>
                {category.isActive ? (
                  <ConfirmActionButton
                    trigger={
                      <>
                        <Pause aria-hidden />
                        Desactivar categoría
                      </>
                    }
                    triggerVariant="ghost"
                    triggerClassName="text-muted-foreground shrink-0"
                    title={`¿Desactivar «${category.name}»?`}
                    description="Sus productos dejarán de verse en la vitrina y no se podrá elegir para productos nuevos. Los productos que ya la tienen la conservan y no se borra nada: al reactivarla, todo vuelve a estar como antes."
                    confirmLabel="Desactivar"
                    pendingLabel="Desactivando…"
                    tone="destructive"
                    action={setCategoryActiveAction.bind(
                      null,
                      category.id,
                      false,
                    )}
                  />
                ) : null}
              </div>
            ) : (
              <ConfirmDeleteButton
                label="Eliminar categoría"
                title={`¿Eliminar «${category.name}»?`}
                description="La categoría se borrará de forma definitiva. Ningún producto la usa, así que no afecta a la vitrina."
                action={deleteCategoryAction.bind(null, category.id)}
              />
            )
          }
        />
      </section>
    </div>
  );
}
