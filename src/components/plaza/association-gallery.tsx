"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { PhotoLightbox } from "@/components/plaza/photo-lightbox";
import { cn } from "@/lib/utils";

export type GalleryPhoto = {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
};

type AssociationGalleryProps = {
  photos: GalleryPhoto[];
};

/** Tiles shown in the mosaic; the last one says how many more there are. */
const MOSAIC_TILES = 5;

/**
 * An association's photos as a mosaic, the first larger; any tile opens the
 * full-screen view (`PhotoLightbox`) to go through all of them with their
 * captions.
 */
function AssociationGallery({ photos }: AssociationGalleryProps) {
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const count = photos.length;
  const shownTiles = photos.slice(0, MOSAIC_TILES);
  const hidden = count - shownTiles.length;

  const open = (photoIndex: number, opener: HTMLButtonElement) => {
    openerRef.current = opener;
    setIndex(photoIndex);
  };

  // The mosaic's arrangement by how many tiles there are.
  const layout =
    shownTiles.length === 1
      ? "sm:grid-cols-1"
      : shownTiles.length === 2
        ? "sm:grid-cols-2"
        : shownTiles.length === 3
          ? "sm:grid-cols-[2fr_1fr] sm:grid-rows-2"
          : "sm:grid-cols-[2fr_1fr_1fr] sm:grid-rows-2";

  return (
    <>
      <ul
        className={cn(
          "grid grid-cols-2 gap-2 sm:gap-3",
          layout,
          shownTiles.length > 2 && "sm:h-[26rem] lg:h-[30rem]",
        )}
      >
        {shownTiles.map((photo, tileIndex) => {
          const isFirst = tileIndex === 0;
          const isMore = hidden > 0 && tileIndex === shownTiles.length - 1;
          return (
            <li
              key={photo.id}
              className={cn(
                "relative min-h-0",
                isFirst && "col-span-2 sm:col-span-1",
                isFirst && shownTiles.length > 2 && "sm:row-span-2",
                // With four tiles, the last one spans the bottom row.
                shownTiles.length === 4 && tileIndex === 3 && "sm:col-span-2",
              )}
            >
              <button
                type="button"
                onClick={(event) => open(tileIndex, event.currentTarget)}
                aria-label={`Ver foto ${tileIndex + 1} de ${count}${photo.caption ? `: ${photo.caption}` : ""}`}
                className={cn(
                  "group bg-muted relative block w-full overflow-hidden",
                  shownTiles.length > 2
                    ? "aspect-4/3 sm:aspect-auto sm:h-full"
                    : shownTiles.length === 1
                      ? "aspect-16/9"
                      : "aspect-4/3",
                  !isFirst && shownTiles.length > 1 && "max-sm:aspect-square",
                )}
              >
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes={
                    isFirst
                      ? "(min-width: 1024px) 36rem, 100vw"
                      : "(min-width: 1024px) 18rem, 50vw"
                  }
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                {isMore ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-lg font-semibold text-white">
                    +{hidden + 1} fotos
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <PhotoLightbox
        photos={photos}
        index={index}
        onIndexChange={setIndex}
        returnFocusRef={openerRef}
        label="Fotos de la asociación"
      />
    </>
  );
}

export { AssociationGallery };
