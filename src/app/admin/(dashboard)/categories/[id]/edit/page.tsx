import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ActiveStatusBadge } from "@/components/admin/status-badge";
import { getEditableCategory } from "@/lib/admin/categories";
import getCurrentProfile from "@/lib/auth/get-current-profile";
import { getProductsByCategoryHref } from "@/lib/public-routes";

import { deleteCategoryAction, updateCategoryAction } from "../../actions";

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
          description="Cambia el nombre o la descripción. Los productos conservan la categoría y ven el nombre nuevo."
          actions={
            <ActiveStatusBadge
              status={category.isActive ? "ACTIVE" : "INACTIVE"}
            />
          }
        />
      </div>

      <dl className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-sm">
        <dt className="font-mono text-xs tracking-[0.06em] uppercase">
          Dirección en el filtro
        </dt>
        <dd className="text-foreground font-mono text-xs break-all">
          {getProductsByCategoryHref(category.slug)}
        </dd>
        <dd className="w-full">
          No cambia al renombrarla, para no romper los enlaces ya compartidos.
        </dd>
      </dl>

      <CategoryForm
        action={updateCategoryAction.bind(null, category.id)}
        cancelHref="/admin/categories"
        submitLabel="Guardar cambios"
        defaultValues={{
          name: category.name,
          description: category.description ?? "",
        }}
        secondaryAction={
          <ConfirmDeleteButton
            label="Eliminar categoría"
            title={`¿Eliminar «${category.name}»?`}
            description="La categoría se borrará de forma definitiva. Solo es posible porque ningún producto la usa."
            action={deleteCategoryAction.bind(null, category.id)}
            disabled={inUse}
            aria-describedby={inUse ? "eliminar-nota" : undefined}
          />
        }
        actionsNote={
          inUse ? (
            <p
              id="eliminar-nota"
              className="text-muted-foreground max-w-xl text-center text-sm sm:text-left"
            >
              No se puede eliminar:{" "}
              {category.productCount === 1
                ? "1 producto la usa"
                : `${category.productCount} productos la usan`}
              . Puedes desactivarla en su lugar.
            </p>
          ) : null
        }
      />
    </div>
  );
}
