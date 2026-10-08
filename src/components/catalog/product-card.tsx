import Image from "next/image";
import Link from "next/link";

import { AromaLogo } from "@/components/brand/aroma-logo";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CatalogProduct } from "@/lib/catalog/queries";
import { getMediaUrl } from "@/lib/media";
import { getProductDetailHref } from "@/lib/public-routes";

type ProductCardProps = {
  product: CatalogProduct;
};

function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getMediaUrl(product.imageObjectKey);

  return (
    <Link
      href={getProductDetailHref(product.associationSlug, product.slug)}
      className="group focus-visible:ring-ring/30 block h-full rounded-4xl outline-none focus-visible:ring-3"
    >
      <Card className="h-full pt-0 transition-shadow group-hover:shadow-lg">
        <div className="bg-muted relative aspect-4/3 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.imageAltText ?? product.name}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <AromaLogo
                variant="symbol"
                className="w-20 opacity-30 grayscale"
                sizes="80px"
              />
            </div>
          )}
        </div>

        <CardHeader>
          <p className="text-primary text-xs font-medium">
            {product.categoryName}
          </p>
          <CardTitle className="group-hover:text-primary text-lg transition-colors">
            {product.name}
          </CardTitle>
          {product.shortDescription ? (
            <CardDescription className="line-clamp-2 leading-6">
              {product.shortDescription}
            </CardDescription>
          ) : null}
          <p className="text-muted-foreground pt-2 text-xs">
            {product.associationName}
          </p>
        </CardHeader>
      </Card>
    </Link>
  );
}

export { ProductCard };
