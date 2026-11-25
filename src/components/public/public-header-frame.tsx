"use client";

import { type ReactNode, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/** Id of the home's first block. */
export const HOME_HERO_ID = "inicio";

/*
 * Hysteresis: the bar compacts once the page has scrolled past 80px and
 * expands again only back above 20px, so a slow scroll near one threshold
 * cannot flip it back and forth.
 */
const COMPACT_SENTINEL_ID = "cabecera-compactar";
const EXPAND_SENTINEL_ID = "cabecera-expandir";

/**
 * Two invisible marks at the top of the page, 20px and 80px down, watched
 * by the header instead of listening to every scroll event.
 */
function HeaderScrollSentinels() {
  return (
    <div aria-hidden className="pointer-events-none relative h-0">
      <div id={EXPAND_SENTINEL_ID} className="absolute top-5 h-px w-px" />
      <div id={COMPACT_SENTINEL_ID} className="absolute top-20 h-px w-px" />
    </div>
  );
}

/**
 * The public header's two states: a roomy white bar at the top of the page,
 * and, once the page scrolls, a compact bar with a soft shadow. The sticky
 * slot keeps the roomy height in both states, so compacting the bar never
 * moves the page under it (which would scroll it back across the threshold).
 */
function PublicHeaderFrame({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const compactMark = document.getElementById(COMPACT_SENTINEL_ID);
    const expandMark = document.getElementById(EXPAND_SENTINEL_ID);
    if (!compactMark || !expandMark) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        // Only a mark gone above the viewport counts as scrolled past.
        const above = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        if (entry.target === compactMark && above) setScrolled(true);
        if (entry.target === expandMark && entry.isIntersecting) {
          setScrolled(false);
        }
      }
    });
    observer.observe(compactMark);
    observer.observe(expandMark);
    return () => observer.disconnect();
  }, []);

  return (
    // Transparent to clicks: below the compact bar, the slot's spare
    // height lies over the page.
    <div className="pointer-events-none sticky top-0 z-40 h-[calc(4rem+1px)] md:h-[calc(5.0625rem+1px)]">
      <header
        data-scrolled={scrolled || undefined}
        className={cn(
          "group/header bg-card pointer-events-auto border-b transition-[box-shadow,border-color] duration-200 ease-out motion-reduce:transition-none",
          scrolled &&
            "border-transparent shadow-[0_6px_24px_oklch(0_0_0/0.08)]",
        )}
      >
        {children}
      </header>
    </div>
  );
}

export { HeaderScrollSentinels, PublicHeaderFrame };
