"use client";

import { Expand, X } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type ImageZoomProps = {
  /** The full image: the stored original, or the local preview's blob. */
  src: string;
  alt: string;
  /** What the button says to screen readers, e.g. «Ver la portada completa». */
  label: string;
  /** The preview as the page shows it, usually cropped to its frame. */
  children: ReactNode;
  className?: string;
};

/**
 * A cropped admin preview that opens the image whole: a dialog with the
 * picture uncropped, as large as the screen allows, and its real size in
 * pixels, to check what the crop leaves out and whether it is sharp enough.
 * Escape, the close button or a click outside close it.
 */
function ImageZoom({ src, alt, label, children, className }: ImageZoomProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [size, setSize] = useState<{ width: number; height: number }>();
  // The original is fetched only once someone opens it.
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          dialogRef.current?.showModal();
        }}
        aria-label={label}
        title="Ver completa"
        className={cn(
          "group focus-visible:outline-ring relative block w-full cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-2",
          className,
        )}
      >
        {children}
        <span
          aria-hidden
          className="text-foreground absolute right-2 bottom-2 inline-flex size-8 items-center justify-center rounded-full bg-white/90 shadow-[0_2px_8px_oklch(0.25_0.03_262/0.25)] transition-transform duration-150 group-hover:scale-110"
        >
          <Expand className="size-4" />
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={alt || label}
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          // A click on the backdrop (the dialog itself), not on its content.
          if (event.target === event.currentTarget) {
            event.currentTarget.close();
          }
        }}
        className="cuaderno m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-5xl overflow-hidden rounded-md bg-transparent p-0 text-white backdrop:bg-[oklch(0.16_0.02_262/0.96)]"
      >
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <div className="flex items-center justify-between gap-3 pb-2">
            <p className="text-sm font-bold text-white/85 tabular-nums">
              {size ? `${size.width} × ${size.height} px` : " "}
            </p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Cerrar"
              autoFocus
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/45 transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>
          {/* The original as stored, not an optimized copy: what is checked
              here is the file itself. */}
          {isOpen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt}
              onLoad={(event) =>
                setSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                })
              }
              className="mx-auto min-h-0 max-w-full flex-1 object-contain"
              style={{ maxHeight: "calc(100dvh - 6rem)" }}
            />
          ) : null}
        </div>
      </dialog>
    </>
  );
}

export { ImageZoom };
