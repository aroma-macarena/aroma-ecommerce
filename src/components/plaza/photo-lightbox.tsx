"use client";

import { ArrowLeft, ArrowRight, X } from "lucide-react";
import Image from "next/image";
import {
  type KeyboardEvent,
  type RefObject,
  type TouchEvent,
  useEffect,
  useRef,
} from "react";

export type LightboxPhoto = {
  id: string;
  url: string;
  alt: string;
  caption?: string | null;
};

type PhotoLightboxProps = {
  photos: LightboxPhoto[];
  /** The photo shown, or null while closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
  /** Gets focus back when the view closes: the tile that opened it. */
  returnFocusRef: RefObject<HTMLElement | null>;
  label: string;
};

const SWIPE_DISTANCE = 48;

/**
 * A photo whole and as large as the screen allows, on black: a modal dialog
 * with «N / M», the caption, arrows, the keyboard's arrow keys and a swipe.
 * Escape or the close button return focus to what opened it. Shared by the
 * association's mosaic and the product page.
 */
function PhotoLightbox({
  photos,
  index,
  onIndexChange,
  returnFocusRef,
  label,
}: PhotoLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const count = photos.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
  }, [index]);

  const step = (by: number) =>
    onIndexChange(index === null ? null : (index + by + count) % count);

  const onKeyDown = (event: KeyboardEvent) => {
    if (count < 2) return;
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

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      onClose={() => {
        onIndexChange(null);
        returnFocusRef.current?.focus();
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
              {count > 1 ? `${index! + 1} / ${count}` : null}
            </p>
            <button
              type="button"
              onClick={() => onIndexChange(null)}
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
  );
}

export { PhotoLightbox };
