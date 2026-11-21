"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Container } from "@/components/public/container";

type ProducerCarouselProps = {
  /** The section's title row (heading and intro). */
  header: ReactNode;
  /** The producer cards, as list items. */
  children: ReactNode;
};

/**
 * The producers as a horizontal rail. On wide screens it is clipped at the
 * content column, with three and a half cards showing, and previous / next
 * arrows that move one whole card; on phones it runs to the screen's edge
 * and moves by swipe. Cards always stop on the column's left edge.
 */
function ProducerCarousel({ header, children }: ProducerCarouselProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setAtStart(list.scrollLeft <= 1);
    setAtEnd(list.scrollLeft + list.clientWidth >= list.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const onChange = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    onChange();
    list.addEventListener("scroll", onChange, { passive: true });
    const resize = new ResizeObserver(onChange);
    resize.observe(list);
    return () => {
      cancelAnimationFrame(frame);
      list.removeEventListener("scroll", onChange);
      resize.disconnect();
    };
  }, [update]);

  const move = (direction: 1 | -1) => {
    // Dimmed arrows stay focusable (a disabled button would drop the
    // keyboard focus at the end of the rail) but do nothing.
    if (direction === -1 ? atStart : atEnd) return;
    const list = listRef.current;
    const card = list?.querySelector("li");
    if (!list || !card) return;
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    list.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: reduce.matches ? "auto" : "smooth",
    });
  };

  return (
    <Container>
      <div className="flex items-center justify-between gap-6">
        {header}
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-disabled={atStart}
            aria-label="Productoras anteriores"
            className="border-foreground/30 hover:bg-foreground/5 text-foreground inline-flex size-11 items-center justify-center rounded-full border transition-[background-color,opacity] aria-disabled:cursor-default aria-disabled:opacity-30 aria-disabled:hover:bg-transparent"
          >
            <ArrowLeft aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-disabled={atEnd}
            aria-label="Productoras siguientes"
            className="border-foreground/30 hover:bg-foreground/5 text-foreground inline-flex size-11 items-center justify-center rounded-full border transition-[background-color,opacity] aria-disabled:cursor-default aria-disabled:opacity-30 aria-disabled:hover:bg-transparent"
          >
            <ArrowRight aria-hidden className="size-5" />
          </button>
        </div>
      </div>
      {/* Phones: the rail runs to the screen's edges (negative margins undo
          the column's padding). Wide screens: it stays inside the column,
          4px wider on each side so the focus ring is not clipped. */}
      <ul
        ref={listRef}
        className="-mx-5 mt-5 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto overscroll-x-contain px-5 pt-1 pb-3 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:-mx-1 lg:scroll-px-1 lg:px-1 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
    </Container>
  );
}

export { ProducerCarousel };
