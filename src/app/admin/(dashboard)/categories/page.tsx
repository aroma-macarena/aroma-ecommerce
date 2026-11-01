import { Plus, Tags } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminCategoryList } from "@/components/admin/admin-category-list";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { buttonVariants } from "@/components/ui/button";
import { getAdminCategories } from "@/lib/admin/categories";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import { setCategoryActiveAction } from "./actions";

export const metadata: Metadata = {
  title: "Categorías",
};

const confirmations: Record<string, string> = {
  creada: "Categoría creada. Ya se puede elegir para productos nuevos.",
  actualizada: "Cambios guardados.",
  activada: "Categoría activada.",
  desactivada: "Categoría desactivada. Sus productos se conservan.",
  eliminada: "Categoría eliminada.",
};

const warnings: Record<string, string> = {
  "en-uso":
    "No se pudo eliminar: la categoría tiene productos. Puedes desactivarla en su lugar.",
};

export default async function AdminCategoriesPage({
  searchParams,
}: PageProps<"/admin/categories">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const categories = await getAdminCategories(result.currentProfile);

  // Shared taxonomy: association administrators do not manage it.
  if (!categories) {
    notFound();
  }

  const { estado } = await searchParams;
  const confirmation =
    typeof estado === "string" ? confirmations[estado] : undefined;
  const warning = typeof estado === "string" ? warnings[estado] : undefined;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Alianza AROMA"
        title="Categorías"
        description="Las categorías que comparten todas las asociaciones. Desactivar una oculta sus productos de la vitrina y la retira de los productos nuevos, sin borrar nada."
        actions={
          <Link
            href="/admin/categories/new"
            className={buttonVariants({ className: "w-full md:w-auto" })}
          >
            <Plus aria-hidden />
            Nueva categoría
          </Link>
        }
      />

      {confirmation ? (
        <AdminNotice tone="success">{confirmation}</AdminNotice>
      ) : null}
      {warning ? <AdminNotice tone="error">{warning}</AdminNotice> : null}

      {categories.length > 0 ? (
        <AdminCategoryList
          categories={categories}
          setActiveAction={(categoryId, isActive) =>
            setCategoryActiveAction.bind(null, categoryId, isActive)
          }
        />
      ) : (
        <AdminEmptyState
          icon={Tags}
          title="Aún no hay categorías"
          description="Crea la primera para que las asociaciones puedan clasificar sus productos."
        />
      )}
    </div>
  );
}
