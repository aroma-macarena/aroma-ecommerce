import { ChevronRight, ExternalLink, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/admin/status-badge";
import type { AdminProduct } from "@/lib/admin/products";
import { getMediaUrl } from "@/lib/media";
import { getProductDetailHref } from "@/lib/public-routes";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  timeZone: "America/Bogota",
});

type AdminProductListProps = {
  products: AdminProduct[];
  label: string;
  showAssociation?: boolean;
};

/** The product's main photo, greyed when it is not on the storefront. */
function Thumbnail({ product }: { product: AdminProduct }) {
  const url = getMediaUrl(product.thumbnailObjectKey);
  return (
    <span className="bg-muted relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border">
      {url ? (
        <Image
          src={url}
          alt=""
          fill
          sizes="48px"
          className={cn(
            "object-cover",
            product.status === "PAUSED" && "grayscale",
          )}
        />
      ) : (
        <Package aria-hidden className="text-muted-foreground size-5" />
      )}
    </span>
  );
}

/**
 * What is missing, with the same correction mark as «Te falta» on the home
 * page, for the products this administrator can fix.
 */
function MissingNote({ product }: { product: AdminProduct }) {
  if (!product.canManage || product.thumbnailObjectKey) return null;
  return (
    <span className="text-correction flex items-center gap-1.5 text-sm font-bold">
      <span
        aria-hidden
        className="border-correction size-3 shrink-0 rounded-full border-2"
      />
      No tiene foto
    </span>
  );
}

/**
 * The product's page on the storefront, as an icon beside the name, when the
 * public can see it. Sits above the row's stretched link.
 */
function StorefrontLink({ product }: { product: AdminProduct }) {
  if (
    product.status !== "PUBLISHED" ||
    product.associationStatus !== "ACTIVE" ||
    !product.categoryIsActive
  ) {
    return null;
  }
  return (
    <Link
      href={getProductDetailHref(product.associationSlug, product.slug)}
      target="_blank"
      aria-label={`Ver ${product.name} en la vitrina (se abre en una nueva pestaña)`}
      title="Ver en la vitrina"
      className="text-muted-foreground hover:text-primary relative z-10 -my-2 inline-flex size-9 shrink-0 items-center justify-center rounded-md"
    >
      <ExternalLink aria-hidden className="size-4" />
    </Link>
  );
}

/**
 * The name: a blue link to the product's admin page that stretches over the
 * whole row (the row's `relative` is the box), or plain text when read-only.
 */
function NameLink({ product }: { product: AdminProduct }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      {product.canManage ? (
        <Link
          href={`/admin/products/${product.id}`}
          className="text-primary min-w-0 leading-snug font-bold wrap-anywhere underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none [&:focus-visible]:after:outline-2 [&:focus-visible]:after:-outline-offset-2 [&:focus-visible]:after:outline-[var(--ring)]"
        >
          {product.name}
        </Link>
      ) : (
        <span className="min-w-0 leading-snug font-bold wrap-anywhere">
          {product.name}
        </span>
      )}
      <StorefrontLink product={product} />
    </span>
  );
}

/** What else is worth knowing about a row: an inactive category or owner. */
function contextNote(product: AdminProduct) {
  if (product.associationStatus !== "ACTIVE") return "Asociación inactiva";
  if (!product.categoryIsActive) return "Categoría inactiva";
  return null;
}

/**
 * Products as rows that open the product: photo, name, where it belongs and
 * its status. A table with sortable reading order on wide screens; the same
 * rows stacked on phones. Read-only rows (other associations' products) do
 * not link.
 */
function AdminProductList({
  products,
  label,
  showAssociation = false,
}: AdminProductListProps) {
  return (
    <div className="bg-card overflow-hidden rounded-md border">
      <table className="hidden w-full text-left xl:table">
        <caption className="sr-only">{label}</caption>
        <thead className="bg-muted/60 text-muted-foreground text-sm">
          <tr>
            <th scope="col" className="py-2.5 pr-4 pl-4 font-bold">
              Producto
            </th>
            {showAssociation ? (
              <th scope="col" className="py-2.5 pr-4 font-bold">
                Asociación
              </th>
            ) : null}
            <th scope="col" className="py-2.5 pr-4 font-bold">
              Categoría
            </th>
            <th scope="col" className="w-32 py-2.5 pr-4 font-bold">
              Estado
            </th>
            <th scope="col" className="w-28 py-2.5 pr-4 text-right font-bold">
              Cambiado
            </th>
          </tr>
        </thead>
        <tbody className="divide-y border-t">
          {products.map((product) => {
            const note = contextNote(product);
            const href = product.canManage
              ? `/admin/products/${product.id}`
              : null;
            return (
              <tr
                key={product.id}
                className={cn(
                  "relative",
                  href && "hover:bg-accent/50 transition-colors duration-150",
                )}
              >
                <th scope="row" className="py-2.5 pr-4 pl-4 font-normal">
                  <span className="flex items-center gap-3">
                    <Thumbnail product={product} />
                    <span className="min-w-0">
                      <NameLink product={product} />
                      <MissingNote product={product} />
                    </span>
                  </span>
                </th>
                {showAssociation ? (
                  <td className="py-2.5 pr-4">
                    {product.associationName}
                    {note === "Asociación inactiva" ? (
                      <span className="text-muted-foreground block text-sm">
                        {note}
                      </span>
                    ) : null}
                  </td>
                ) : null}
                <td className="py-2.5 pr-4">
                  {product.categoryName}
                  {note === "Categoría inactiva" ? (
                    <span className="text-muted-foreground block text-sm">
                      {note}
                    </span>
                  ) : null}
                </td>
                <td className="py-2.5 pr-4">
                  <StatusBadge status={product.status} />
                </td>
                <td className="text-muted-foreground py-2.5 pr-4 text-right text-sm">
                  {dateFormatter.format(new Date(product.updatedAt))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ul aria-label={label} className="divide-y xl:hidden">
        {products.map((product) => {
          const note = contextNote(product);
          const meta = [
            showAssociation ? product.associationName : null,
            product.categoryName,
          ]
            .filter(Boolean)
            .join(" · ");
          const content = (
            <>
              <Thumbnail product={product} />
              <span className="min-w-0 flex-1">
                <NameLink product={product} />
                <span className="text-muted-foreground block text-sm leading-snug">
                  {meta}
                </span>
                {note ? (
                  <span className="text-muted-foreground block text-sm">
                    {note}
                  </span>
                ) : null}
                <MissingNote product={product} />
                <StatusBadge status={product.status} className="mt-1.5" />
              </span>
            </>
          );
          return (
            <li
              key={product.id}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3",
                product.canManage &&
                  "hover:bg-accent/50 transition-colors duration-150",
              )}
            >
              {content}
              {product.canManage ? (
                <ChevronRight
                  aria-hidden
                  className="text-primary size-5 shrink-0"
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { AdminProductList };
