import Image from "next/image";
import Link from "next/link";

import { AromaLogo } from "@/components/brand/aroma-logo";
import { AssociationLogo } from "@/components/catalog/association-logo";
import type { CatalogProduct } from "@/lib/catalog/queries";
import { getMediaUrl } from "@/lib/media";
import { formatReferencePrice } from "@/lib/presentation-format";
import { getProductDetailHref } from "@/lib/public-routes";

type PlazaProductCardProps = {
  product: CatalogProduct;
  /**
   * Off where every card shares the producer and the page already names it
   * (its profile, «Más de…»). The row stays, empty, so the rows still line
   * up.
   */
  showAssociation?: boolean;
};

/**
 * A product led by its photo, with its producer named right under it so
 * nobody has to guess who makes it. The name link covers the whole card.
 */
function PlazaProductCard({
  product,
  showAssociation = true,
}: PlazaProductCardProps) {
  const imageUrl = getMediaUrl(product.imageObjectKey);
  const fromPrice = formatReferencePrice(product.fromPrice);

  return (
    // Six rows shared with the cards beside it (subgrid): photo,
    // association, name, place, description and price. A name or a
    // description that runs longer makes room in every card of the row, so
    // their lines stay level, and the price always sits at the bottom.
    <article
      aria-labelledby={`producto-${product.id}`}
      className="group has-[a:focus-visible]:outline-ring relative row-span-6 grid grid-rows-subgrid has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4"
    >
      <div className="bg-muted relative aspect-4/5 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.imageAltText ?? product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
            <AromaLogo variant="symbol" className="w-14" />
            <span className="text-muted-foreground text-sm font-semibold">
              Foto en camino
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-4">
        {showAssociation ? (
          <>
            {getMediaUrl(product.associationLogoObjectKey) ? (
              <AssociationLogo
                name={product.associationName}
                objectKey={product.associationLogoObjectKey}
                sizes="24px"
                className="size-6 rounded-full"
              />
            ) : null}
            <span className="text-muted-foreground line-clamp-1 text-sm font-medium">
              {product.associationName}
            </span>
          </>
        ) : null}
      </div>
      <h3
        id={`producto-${product.id}`}
        className="font-editorial mt-2 text-[1.625rem] leading-[1.1] font-semibold tracking-[-0.01em] wrap-anywhere"
      >
        <Link
          href={getProductDetailHref(product.associationSlug, product.slug)}
          className="decoration-primary decoration-2 underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0"
        >
          {product.name}
        </Link>
      </h3>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
        {product.associationLocation ? (
          <>
            <span className="font-editorial italic">
              {product.associationLocation}
            </span>
            <span aria-hidden className="text-muted-foreground/50 text-sm">
              ·
            </span>
          </>
        ) : null}
        <span className="text-muted-foreground text-sm">
          {product.categoryName}
        </span>
      </p>
      {product.shortDescription ? (
        <p className="text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
          {product.shortDescription}
        </p>
      ) : null}
      <p className="row-start-6 flex items-baseline justify-between gap-3 self-end border-t pt-3 mt-4">
        <span className="text-sm font-medium">
          {fromPrice ? "Desde" : "Precio"}
        </span>
        <span className="font-sign text-[1.75rem] leading-none">
          {fromPrice ?? "A consultar"}
        </span>
      </p>
    </article>
  );
}

/**
 * Product cards in one to three columns. Each card spans six rows of this
 * grid (see PlazaProductCard); the space between rows of cards is each
 * card's bottom padding, and the list's negative margin takes the last one
 * back.
 */
function PlazaProductGrid({
  products,
  showAssociation = true,
}: {
  products: CatalogProduct[];
  showAssociation?: boolean;
}) {
  return (
    <ul className="-mb-12 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li
          key={product.id}
          className="row-span-6 grid min-w-0 grid-rows-subgrid pb-12"
        >
          <PlazaProductCard
            product={product}
            showAssociation={showAssociation}
          />
        </li>
      ))}
    </ul>
  );
}

export { PlazaProductCard, PlazaProductGrid };
