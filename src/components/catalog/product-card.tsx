import Image from "next/image";

import { AromaLogo } from "@/components/brand/aroma-logo";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import type { CatalogProduct } from "@/lib/catalog/queries";
import { getMediaUrl } from "@/lib/media";

type ProductCardProps = {
  product: CatalogProduct;
};

function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getMediaUrl(product.imageObjectKey);

  return (
    <article className="h-full" aria-labelledby={`producto-${product.id}`}>
      <Card className="h-full pt-0 wrap-anywhere">
        <div className="bg-muted relative aspect-4/3 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.imageAltText ?? product.name}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <AromaLogo
                variant="symbol"
                className="w-16 opacity-40 grayscale"
                sizes="80px"
              />
              <span className="text-muted-foreground text-xs">
                Imagen no disponible
              </span>
            </div>
          )}
        </div>

        <CardHeader>
          <p className="text-primary text-xs font-medium">
            {product.categoryName}
          </p>
          <h3
            id={`producto-${product.id}`}
            className="text-xl font-semibold tracking-tight"
          >
            {product.name}
          </h3>
          {product.shortDescription ? (
            <CardDescription className="leading-relaxed">
              {product.shortDescription}
            </CardDescription>
          ) : null}
          <p className="text-muted-foreground border-t pt-3 text-sm">
            {product.associationName}
          </p>
        </CardHeader>
      </Card>
    </article>
  );
}

export { ProductCard };
