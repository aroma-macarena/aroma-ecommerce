"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import {
  type KeyboardEvent,
  type ReactNode,
  type TouchEvent,
  useRef,
  useState,
} from "react";

import { AromaLogo } from "@/components/brand/aroma-logo";
import { HOME_HERO_ID } from "@/components/public/public-header-frame";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  /** "Miel de abejas pura, de Colectivo de…": announced when it changes. */
  label: string;
  imageUrl: string | null;
  imageAlt: string;
  /** The product card, rendered on the server. */
  card: ReactNode;
};

type HeroCarouselProps = {
  /** The page's h1 and its lead, both edited from the admin. */
  title: string;
  lead: string;
  slides: HeroSlide[];
};

const SWIPE_DISTANCE = 48;

/**
 * The home's first block as a carousel: one featured product per
 * organization. The photo spans the full width with the page's title on its
 * darkened lower left; the product card floats on the right (under the
 * photo on phones). Previous / next buttons, arrow keys and, on touch
 * screens, a horizontal swipe move between products, with a crossfade and
 * no page load. There is no autoplay. The next photo is loaded ahead.
 */
function HeroCarousel({ title, lead, slides }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [announce, setAnnounce] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const count = slides.length;
  const hasMany = count > 1;
  const slide = slides[index];

  const go = (step: number) => {
    setIndex((current) => (current + step + count) % count);
    setAnnounce(true);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!hasMany) return;
    if (event.key === "ArrowLeft") go(-1);
    if (event.key === "ArrowRight") go(1);
  };

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || !hasMany) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
    }
  };

  // The photos kept in the page: the current one, the previous one (so it
  // can fade out) and the next one (loaded ahead of time).
  const mounted = new Set(
    hasMany ? [index, (index + 1) % count, (index - 1 + count) % count] : [0],
  );

  return (
    <section
      id={HOME_HERO_ID}
      aria-labelledby="inicio-titulo"
      aria-roledescription={hasMany ? "carrusel" : undefined}
      onKeyDown={onKeyDown}
      className="bg-background relative grid scroll-mt-16 grid-cols-1 lg:h-[min(calc(100svh-7.625rem),42rem)] lg:grid-cols-[minmax(0,1fr)_23.75rem] lg:gap-12 lg:px-[max(2.5rem,calc((100vw-72rem)/2+2.5rem))]"
    >
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="bg-muted relative col-start-1 row-start-1 aspect-4/3 touch-pan-y overflow-hidden after:pointer-events-none after:absolute after:inset-0 after:bg-linear-to-t after:from-black/90 after:via-black/65 after:via-50% after:to-transparent sm:aspect-16/10 lg:absolute lg:inset-0 lg:col-auto lg:row-auto lg:aspect-auto lg:after:bg-[radial-gradient(ellipse_80%_85%_at_0%_100%,oklch(0_0_0/0.9),oklch(0_0_0/0.68)_40%,oklch(0_0_0/0.25)_72%,transparent_100%)]"
      >
        {slides.map((item, itemIndex) =>
          mounted.has(itemIndex) ? (
            <div
              key={item.id}
              aria-hidden={itemIndex !== index}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
                itemIndex === index ? "opacity-100" : "opacity-0",
              )}
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={itemIndex === index ? item.imageAlt : ""}
                  fill
                  sizes="100vw"
                  preload={itemIndex === 0}
                  loading={itemIndex === 0 ? undefined : "eager"}
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                  <AromaLogo variant="symbol" className="w-16 md:w-24" />
                  <p className="text-muted-foreground text-sm font-semibold">
                    Foto en camino
                  </p>
                </div>
              )}
            </div>
          ) : null,
        )}
      </div>

      {/* The title on the photo's darkened lower left, on the container's
          left edge, with the carousel controls under it. */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative z-10 col-start-1 row-start-1 self-end px-5 pt-5 pb-5 text-white sm:px-8 sm:pb-7 lg:px-0 lg:pt-10 lg:pb-14"
      >
        <h1
          id="inicio-titulo"
          className="font-sign text-[2.75rem] leading-[0.88] text-balance uppercase wrap-anywhere sm:text-[4rem] lg:text-[4.75rem]"
        >
          {title}
        </h1>
        <p className="font-editorial mt-2 max-w-[42ch] text-base leading-relaxed text-white/90 sm:mt-3 sm:text-lg">
          {lead}
        </p>

        {hasMany ? (
          <div className="mt-4 flex items-center gap-3 [--ring:oklch(1_0_0)] sm:mt-5">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Producto destacado anterior"
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/45 bg-black/20 text-white transition-colors hover:bg-white/20"
            >
              <ArrowLeft aria-hidden className="size-5" />
            </button>
            <p
              aria-hidden
              className="min-w-[4.5ch] text-center text-sm font-semibold tabular-nums text-white/85"
            >
              {index + 1} / {count}
            </p>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Producto destacado siguiente"
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/45 bg-black/20 text-white transition-colors hover:bg-white/20"
            >
              <ArrowRight aria-hidden className="size-5" />
            </button>
            <p aria-live="polite" className="sr-only">
              {announce
                ? `Destacado ${index + 1} de ${count}: ${slide.label}`
                : ""}
            </p>
          </div>
        ) : null}
      </div>

      {/* The product card: floating at the container's right edge on wide
          screens, full width under the photo on phones. */}
      <div
        key={slide.id}
        aria-roledescription={hasMany ? "diapositiva" : undefined}
        aria-label={hasMany ? `${index + 1} de ${count}` : undefined}
        className="hero-card-in bg-card relative z-10 flex flex-col px-5 pt-5 pb-8 sm:px-8 sm:pt-6 lg:col-start-2 lg:row-start-1 lg:my-10 lg:max-h-[calc(100%-5rem)] lg:self-center lg:overflow-y-auto lg:px-6 lg:py-5 lg:shadow-[0_18px_48px_oklch(0_0_0/0.22)]"
      >
        {slide.card}
      </div>
    </section>
  );
}

export { HeroCarousel };
