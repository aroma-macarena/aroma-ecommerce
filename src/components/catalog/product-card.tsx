import Image from "next/image";
import Link from "next/link";

import { AromaLogo } from "@/components/brand/aroma-logo";
import type { CatalogProduct } from "@/lib/catalog/queries";
import { getMediaUrl } from "@/lib/media";
import { getProductDetailHref } from "@/lib/public-routes";

type ProductCardProps = {
  product: CatalogProduct;
  /** Off on the association's own profile, where it would repeat. */
  showAssociation?: boolean;
};

function ProductCard({ product, showAssociation = true }: ProductCardProps) {
  const imageUrl = getMediaUrl(product.imageObjectKey);

  return (
    // The title link stretches over the whole card, so the card is one target
    // while screen readers hear only the product name as the link.
    <article
      className="group has-[a:focus-visible]:outline-ring relative flex h-full flex-col gap-4 rounded-sm wrap-anywhere has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4"
      aria-labelledby={`producto-${product.id}`}
    >
      <div className="bg-muted relative aspect-4/3 overflow-hidden rounded-sm sm:aspect-4/5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.imageAltText ?? product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <AromaLogo variant="symbol" className="w-20 opacity-35 grayscale" />
            <span className="text-muted-foreground font-mono text-xs tracking-[0.06em] uppercase">
              Sin fotografía
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <p className="text-primary font-mono text-xs font-medium tracking-[0.08em] uppercase">
          {product.categoryName}
        </p>
        <h3
          id={`producto-${product.id}`}
          className="font-heading text-2xl leading-tight font-medium tracking-[-0.015em]"
        >
          <Link
            href={getProductDetailHref(product.associationSlug, product.slug)}
            className="decoration-1 underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0"
          >
            {product.name}
          </Link>
        </h3>
        {product.shortDescription ? (
          <p className="text-muted-foreground leading-relaxed">
            {product.shortDescription}
          </p>
        ) : null}
      </div>

      {showAssociation ? (
        <p className="border-foreground border-t pt-2.5 font-mono text-xs">
          {product.associationName}
        </p>
      ) : null}
    </article>
  );
}

export { ProductCard };
