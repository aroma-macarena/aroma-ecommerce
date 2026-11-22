"use client";

import { Expand } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { AromaLogo } from "@/components/brand/aroma-logo";
import { PhotoLightbox } from "@/components/plaza/photo-lightbox";
import type { PublicProduct } from "@/lib/catalog/queries";
import { getMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  productName: string;
  images: PublicProduct["images"];
};

/**
 * The product's photos. Phones: a strip that scrolls sideways, the next
 * photo peeking at the edge. Wide screens: one large photo, as wide as the
 * column (the origin label below shares its edges), with a row of
 * thumbnails under it; choosing one crossfades the large photo, like the
 * home's carousel. Each photo is rendered once and serves both layouts.
 * Tapping a photo opens it whole, uncropped, in the full-screen view
 * (`PhotoLightbox`), where the arrows go through the rest.
 */
function ProductGallery({ productName, images }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [announce, setAnnounce] = useState(false);
  const [zoomed, setZoomed] = useState<number | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const photoButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const photos = images
    .map((image) => ({ ...image, url: getMediaUrl(image.objectKey) }))
    .filter(
      (image): image is typeof image & { url: string } => image.url !== null,
    );
  const count = photos.length;

  if (count === 0) {
    return (
      <div className="bg-muted flex aspect-4/5 flex-col items-center justify-center gap-3 p-6 text-center">
        <AromaLogo variant="symbol" className="w-16 md:w-20" />
        <span className="text-muted-foreground text-sm font-semibold">
          Foto en camino
        </span>
      </div>
    );
  }

  const show = (index: number) => {
    setActive(index);
    setAnnounce(true);
  };

  return (
    <div className="space-y-2 lg:space-y-3">
      <ul
        aria-label={`Fotos de ${productName}`}
        className={cn(
          "-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 sm:mx-0 sm:px-0",
          // Wide screens: the photos stack in one cell; only the chosen one
          // shows.
          "lg:grid lg:snap-none lg:gap-0 lg:overflow-visible",
        )}
      >
        {photos.map((photo, index) => (
          <li
            key={photo.id}
            className={cn(
              "bg-muted relative aspect-4/5 shrink-0 snap-center overflow-hidden",
              count === 1 ? "w-full" : "w-[85%] sm:w-[70%]",
              "lg:col-start-1 lg:row-start-1 lg:w-full lg:transition-[opacity,visibility] lg:duration-700 lg:ease-out motion-reduce:transition-none",
              index === active ? "lg:opacity-100" : "lg:invisible lg:opacity-0",
            )}
          >
            <button
              ref={(element) => {
                photoButtons.current[index] = element;
              }}
              type="button"
              onClick={() => setZoomed(index)}
              aria-label={`Ampliar foto ${index + 1} de ${count}`}
              className="group absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
            >
              <Image
                src={photo.url}
                alt={photo.altText ?? productName}
                fill
                preload={index === 0}
                sizes="(min-width: 1024px) 34rem, 85vw"
                className="object-cover"
              />
              <span
                aria-hidden
                className="text-foreground absolute right-3 bottom-3 inline-flex size-9 items-center justify-center rounded-full bg-white/90 shadow-[0_2px_8px_oklch(0_0_0/0.2)] transition-transform duration-150 group-hover:scale-110"
              >
                <Expand className="size-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <PhotoLightbox
        photos={photos.map((photo) => ({
          id: photo.id,
          url: photo.url,
          alt: photo.altText ?? productName,
        }))}
        index={zoomed}
        onIndexChange={(next) => {
          // Closing on another photo leaves the large one on it, and focus
          // returns to that photo, the one that stays visible.
          if (next === null && zoomed !== null) {
            openerRef.current = photoButtons.current[zoomed];
          }
          if (next !== null) setActive(next);
          setZoomed(next);
        }}
        returnFocusRef={openerRef}
        label={`Fotos de ${productName}`}
      />

      {count > 1 ? (
        <>
          <p className="text-muted-foreground text-sm lg:hidden">
            {count} fotos · desliza para ver más
          </p>
          <ul
            aria-label={`Elegir foto de ${productName}`}
            className="hidden grid-cols-[repeat(auto-fill,4.5rem)] gap-2 lg:grid"
          >
            {photos.map((photo, index) => (
              <li key={photo.id}>
                <button
                  type="button"
                  onClick={() => show(index)}
                  aria-label={`Ver foto ${index + 1} de ${count}`}
                  aria-current={index === active ? "true" : undefined}
                  className={cn(
                    "bg-muted relative block aspect-4/5 w-full overflow-hidden border-2 transition-[border-color,opacity]",
                    index === active
                      ? "border-foreground"
                      : "hover:border-border border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <Image
                    src={photo.url}
                    alt=""
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
          <p aria-live="polite" className="sr-only">
            {announce ? `Foto ${active + 1} de ${count}` : ""}
          </p>
        </>
      ) : null}
    </div>
  );
}

export { ProductGallery };
