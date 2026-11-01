import Image from "next/image";

import { AromaLogo } from "@/components/brand/aroma-logo";
import type { PublicProduct } from "@/lib/catalog/queries";
import { getMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  productName: string;
  images: PublicProduct["images"];
};

/**
 * The product's photos without client JavaScript: a swipeable strip on
 * mobile and, from desktop, the primary photo large with the rest below.
 */
function ProductGallery({ productName, images }: ProductGalleryProps) {
  const photos = images
    .map((image) => ({ ...image, url: getMediaUrl(image.objectKey) }))
    .filter(
      (image): image is typeof image & { url: string } => image.url !== null,
    );

  if (photos.length === 0) {
    return (
      <div className="bg-muted flex aspect-4/5 flex-col items-center justify-center gap-2 rounded-sm">
        <AromaLogo variant="symbol" className="w-24 opacity-35 grayscale" />
        <span className="text-muted-foreground font-mono text-xs tracking-[0.06em] uppercase">
          Sin fotografía
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ul
        aria-label={`Fotos de ${productName}`}
        className={cn(
          "-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 sm:mx-0 sm:px-0",
          "lg:grid lg:snap-none lg:grid-cols-2 lg:gap-4 lg:overflow-visible",
        )}
      >
        {photos.map((photo, index) => (
          <li
            key={photo.id}
            className={cn(
              "bg-muted relative aspect-4/5 shrink-0 snap-center overflow-hidden rounded-sm lg:w-auto",
              photos.length === 1 ? "w-full" : "w-[85%] sm:w-[70%]",
              index === 0 && "lg:col-span-2",
            )}
          >
            <Image
              src={photo.url}
              alt={photo.altText ?? productName}
              fill
              preload={index === 0}
              sizes={
                index === 0
                  ? "(min-width: 1024px) 34rem, 85vw"
                  : "(min-width: 1024px) 17rem, 85vw"
              }
              className="object-cover"
            />
          </li>
        ))}
      </ul>
      {photos.length > 1 ? (
        <p className="text-muted-foreground font-mono text-xs lg:hidden">
          {photos.length} fotos · desliza para ver más
        </p>
      ) : null}
    </div>
  );
}

export { ProductGallery };
