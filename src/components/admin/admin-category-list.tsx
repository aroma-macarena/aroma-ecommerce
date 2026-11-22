import { ExternalLink, Pause, Play } from "lucide-react";
import Link from "next/link";

import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { ActiveStatusBadge } from "@/components/admin/status-badge";
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

/** "3 de 5", or "Sin productos" when none use it. */
function UsageCell({ category }: { category: AdminCategory }) {
  if (category.productCount === 0) {
    return <span className="text-muted-foreground">Sin productos</span>;
  }
  return (
    <>
      {category.publishedCount}{" "}
      <span className="text-muted-foreground">de {category.productCount}</span>
    </>
  );
}

function StatusAction({
  category,
  setActiveAction,
}: {
  category: AdminCategory;
  setActiveAction: SetActiveAction;
}) {
  return category.isActive ? (
    <ConfirmActionButton
      trigger={
        <>
          <Pause aria-hidden />
          Desactivar
          <span className="sr-only">{category.name}</span>
        </>
      }
      triggerVariant="ghost"
      triggerClassName="text-muted-foreground"
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
      triggerVariant="ghost"
      triggerClassName="text-muted-foreground"
      title={`¿Activar «${category.name}»?`}
      description="Sus productos publicados volverán a verse en la vitrina y se podrá elegir para productos nuevos."
      confirmLabel="Activar"
      pendingLabel="Activando…"
      action={setActiveAction(category.id, true)}
    />
  );
}

/** The category's filter on the storefront, as an icon beside the name. */
function StorefrontLink({ category }: { category: AdminCategory }) {
  if (!category.isActive || category.publishedCount === 0) {
    return null;
  }

  return (
    <Link
      href={getProductsByCategoryHref(category.slug)}
      target="_blank"
      aria-label={`Ver ${category.name} en la vitrina (se abre en una nueva pestaña)`}
      title="Ver en la vitrina"
      className="text-muted-foreground hover:text-primary relative -my-2 inline-flex size-9 shrink-0 items-center justify-center rounded-md"
    >
      <ExternalLink aria-hidden className="size-4" />
    </Link>
  );
}

function NameLink({ category }: { category: AdminCategory }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <Link
        href={`/admin/categories/${category.id}/edit`}
        className="text-primary min-w-0 font-bold wrap-anywhere underline-offset-4 hover:underline"
      >
        {category.name}
      </Link>
      <StorefrontLink category={category} />
    </span>
  );
}

/**
 * Categories as rows whose name opens the category: a table on desktop,
 * stacked rows on phones. Activating or deactivating is the one action left
 * on the row.
 */
function AdminCategoryList({
  categories,
  setActiveAction,
}: AdminCategoryListProps) {
  return (
    <div className="bg-card overflow-hidden rounded-md border">
      <table className="hidden w-full md:table">
        <caption className="sr-only">Categorías de la alianza</caption>
        <thead>
          <tr className="bg-muted/60 text-muted-foreground border-b text-left text-sm">
            <th scope="col" className="py-2.5 pr-4 pl-4 font-bold">
              Categoría
            </th>
            <th scope="col" className="w-32 py-2.5 pr-4 font-bold">
              Estado
            </th>
            <th scope="col" className="w-36 py-2.5 pr-4 font-bold">
              Publicados
            </th>
            <th scope="col" className="w-40 py-2.5 pr-4 text-right font-bold">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr
              key={category.id}
              className="border-b align-top last:border-b-0"
            >
              <th scope="row" className="py-3 pr-4 pl-4 text-left font-normal">
                <NameLink category={category} />
                {category.description ? (
                  <span className="text-muted-foreground line-clamp-1 max-w-xl text-sm">
                    {category.description}
                  </span>
                ) : null}
              </th>
              <td className="py-3 pr-4">
                <ActiveStatusBadge
                  status={category.isActive ? "ACTIVE" : "INACTIVE"}
                />
              </td>
              <td className="py-3 pr-4 whitespace-nowrap">
                <UsageCell category={category} />
              </td>
              <td className="py-2 pr-4 text-right">
                <StatusAction
                  category={category}
                  setActiveAction={setActiveAction}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul aria-label="Categorías de la alianza" className="divide-y md:hidden">
        {categories.map((category) => (
          <li key={category.id} className="space-y-1 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <NameLink category={category} />
              <ActiveStatusBadge
                status={category.isActive ? "ACTIVE" : "INACTIVE"}
                className="shrink-0"
              />
            </div>
            {category.description ? (
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {category.description}
              </p>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm">
                <UsageCell category={category} />
                {category.productCount > 0 ? (
                  <span className="text-muted-foreground">
                    {category.publishedCount === 1
                      ? " publicado"
                      : " publicados"}
                  </span>
                ) : null}
              </p>
              <div className="-mr-3">
                <StatusAction
                  category={category}
                  setActiveAction={setActiveAction}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { AdminCategoryList };
