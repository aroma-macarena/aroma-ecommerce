"use client";

import { ArrowLeft, ArrowRight, X } from "lucide-react";
import Image from "next/image";
import {
  type KeyboardEvent,
  type TouchEvent,
  useEffect,
  useRef,
  useState,
} from "react";

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
const SWIPE_DISTANCE = 48;

/**
 * An association's photos as a mosaic, the first larger, and a full-screen
 * view (a modal dialog) to go through all of them with their captions:
 * arrows, the keyboard's arrow keys or a swipe; Escape or the close button
 * returns to the tile that opened it.
 */
function AssociationGallery({ photos }: AssociationGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const count = photos.length;
  const shownTiles = photos.slice(0, MOSAIC_TILES);
  const hidden = count - shownTiles.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
  }, [index]);

  const open = (photoIndex: number, opener: HTMLButtonElement) => {
    openerRef.current = opener;
    setIndex(photoIndex);
  };
  const step = (by: number) =>
    setIndex((current) =>
      current === null ? current : (current + by + count) % count,
    );

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  };
  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const onTouchEnd = (event: TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || count < 2) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    if (
      Math.abs(dx) > SWIPE_DISTANCE &&
      Math.abs(dx) > Math.abs(touch.clientY - start.y)
    ) {
      step(dx < 0 ? 1 : -1);
    }
  };

  const current = index === null ? null : photos[index];

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

      <dialog
        ref={dialogRef}
        aria-label="Fotos de la asociación"
        onClose={() => {
          setIndex(null);
          openerRef.current?.focus();
        }}
        onKeyDown={onKeyDown}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white backdrop:bg-black"
      >
        {current ? (
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="flex h-full flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <p className="text-sm font-semibold text-white/85 tabular-nums">
                {index! + 1} / {count}
              </p>
              <button
                type="button"
                onClick={() => setIndex(null)}
                aria-label="Cerrar"
                autoFocus
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/45 transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <figure className="flex min-h-0 flex-1 flex-col px-4 pb-6 sm:px-20">
              <div className="relative min-h-0 flex-1">
                <Image
                  key={current.id}
                  src={current.url}
                  alt={current.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
              {current.caption ? (
                <figcaption className="font-editorial mx-auto mt-4 max-w-[60ch] text-center text-lg text-white/90 italic">
                  {current.caption}
                </figcaption>
              ) : null}
            </figure>
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Foto anterior"
                  className="absolute top-1/2 left-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/30 transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6"
                >
                  <ArrowLeft aria-hidden className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Foto siguiente"
                  className="absolute top-1/2 right-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/30 transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6"
                >
                  <ArrowRight aria-hidden className="size-5" />
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}

export { AssociationGallery };
