import { ExternalLink, Pause, Pencil, Play } from "lucide-react";
import Link from "next/link";

import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { ActiveStatusBadge } from "@/components/admin/status-badge";
import { buttonVariants } from "@/components/ui/button";
import type { AdminCategory } from "@/lib/admin/categories";
import { getProductsByCategoryHref } from "@/lib/public-routes";

type SetActiveAction = (
  categoryId: string,
  isActive: boolean,
) => () => Promise<void>;

type AdminCategoryListProps = {
  categories: AdminCategory[];
  setActiveAction: SetActiveAction;
};

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** "3 publicados de 5 productos", or "Sin productos" when none use it. */
function usageLabel({ productCount, publishedCount }: AdminCategory) {
  return productCount === 0
    ? "Sin productos"
    : `${countLabel(publishedCount, "publicado", "publicados")} de ${countLabel(productCount, "producto", "productos")}`;
}

function RowActions({
  category,
  setActiveAction,
}: {
  category: AdminCategory;
  setActiveAction: SetActiveAction;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      <Link
        href={`/admin/categories/${category.id}/edit`}
        className={buttonVariants({
          variant: "outline",
          className: "w-full sm:w-auto",
        })}
      >
        <Pencil aria-hidden />
        Editar
        <span className="sr-only">{category.name}</span>
      </Link>
      {category.isActive ? (
        <ConfirmActionButton
          trigger={
            <>
              <Pause aria-hidden />
              Desactivar
              <span className="sr-only">{category.name}</span>
            </>
          }
          triggerClassName="w-full sm:w-auto"
          title={`¿Desactivar «${category.name}»?`}
          description="Sus productos dejarán de verse en la vitrina y no se podrá elegir para productos nuevos. Los productos que ya la tienen la conservan y no se borra nada: al reactivarla, todo vuelve a estar como antes."
          confirmLabel="Desactivar"
          pendingLabel="Desactivando…"
          tone="destructive"
          action={setActiveAction(category.id, false)}
        />
      ) : (
        <ConfirmActionButton
          trigger={
            <>
              <Play aria-hidden />
              Activar
              <span className="sr-only">{category.name}</span>
            </>
          }
          triggerClassName="w-full sm:w-auto"
          title={`¿Activar «${category.name}»?`}
          description="Sus productos publicados volverán a verse en la vitrina y se podrá elegir para productos nuevos."
          confirmLabel="Activar"
          pendingLabel="Activando…"
          action={setActiveAction(category.id, true)}
        />
      )}
    </div>
  );
}

function StorefrontLink({ category }: { category: AdminCategory }) {
  if (!category.isActive || category.publishedCount === 0) {
    return null;
  }

  return (
    <Link
      href={getProductsByCategoryHref(category.slug)}
      target="_blank"
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline"
    >
      Ver en la vitrina
      <ExternalLink aria-hidden className="size-3" />
      <span className="sr-only">(se abre en una nueva pestaña)</span>
    </Link>
  );
}

/** Categories as a table on desktop and stacked rows on mobile. */
function AdminCategoryList({
  categories,
  setActiveAction,
}: AdminCategoryListProps) {
  return (
    <>
      <table className="hidden w-full text-sm md:table">
        <caption className="sr-only">Categorías de la alianza</caption>
        <thead>
          <tr className="text-muted-foreground border-b text-left font-mono text-[0.6875rem] tracking-[0.06em] uppercase">
            <th scope="col" className="py-2 pr-4 font-medium">
              Categoría
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Estado
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Productos
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-b align-top">
              <th
                scope="row"
                className="max-w-md py-3 pr-4 text-left font-normal"
              >
                <span className="block font-semibold">{category.name}</span>
                {category.description ? (
                  <span className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                    {category.description}
                  </span>
                ) : null}
                <StorefrontLink category={category} />
              </th>
              <td className="py-3 pr-4">
                <ActiveStatusBadge
                  status={category.isActive ? "ACTIVE" : "INACTIVE"}
                />
              </td>
              <td className="py-3 pr-4">{usageLabel(category)}</td>
              <td className="py-3 text-right">
                <RowActions
                  category={category}
                  setActiveAction={setActiveAction}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul aria-label="Categorías de la alianza" className="border-t md:hidden">
        {categories.map((category) => (
          <li key={category.id} className="space-y-2 border-b py-4">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 font-semibold wrap-anywhere">
                {category.name}
              </p>
              <ActiveStatusBadge
                status={category.isActive ? "ACTIVE" : "INACTIVE"}
                className="pt-0.5"
              />
            </div>
            {category.description ? (
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {category.description}
              </p>
            ) : null}
            <p className="text-muted-foreground font-mono text-xs">
              {usageLabel(category)}
            </p>
            <StorefrontLink category={category} />
            <div className="pt-1">
              <RowActions
                category={category}
                setActiveAction={setActiveAction}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export { AdminCategoryList };
