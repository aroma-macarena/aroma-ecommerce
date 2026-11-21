"use client";

import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { AromaLogo } from "@/components/brand/aroma-logo";
import {
  formatZoneDistance,
  getTerritoryZone,
  type TerritoryZone,
  territoryZones,
} from "@/content/territory";
import {
  territoryAspectRatio,
  territoryPercent,
} from "@/lib/territory-geometry";
import { cn } from "@/lib/utils";

export type DirectoryAssociation = {
  slug: string;
  name: string;
  location: string | null;
  description: string | null;
  productCount: number;
  href: string;
  logoUrl: string | null;
  coverUrl: string | null;
  zone: string | null;
};

type AssociationDirectoryProps = {
  associations: DirectoryAssociation[];
  /** The drawn territory, rendered on the server (`TerritoryMap`). */
  map: ReactNode;
};

function formatProductCount(count: number) {
  if (count === 0) {
    return "Aún sin productos publicados";
  }

  return count === 1 ? "1 producto" : `${count} productos`;
}

const PANEL_ID = "zona-seleccionada";

/** Time a preview waits before closing, so the pointer can reach it. */
const PREVIEW_GRACE_MS = 200;
/**
 * With a preview open, the pointer must rest this long on another marker to
 * switch to it: crossing a neighbour on the way to the cards does not.
 */
const SWITCH_INTENT_MS = 150;

type Point = { x: number; y: number };

/**
 * Pushes overlapping markers apart, a little at a time, until each keeps
 * `gap` pixels from the others; markers with room stay on their point.
 */
function spreadMarkers(points: Point[], gap: number, box: Point) {
  const placed = points.map((point) => ({ ...point }));
  for (let round = 0; round < 40; round += 1) {
    let moved = false;
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        const a = placed[i];
        const b = placed[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let distance = Math.hypot(dx, dy);
        if (distance >= gap) continue;
        if (distance < 0.01) {
          // Same point: part them along a fixed diagonal.
          dx = 1;
          dy = -1;
          distance = Math.SQRT2;
        }
        const push = (gap - distance) / 2 + 0.5;
        const ux = dx / distance;
        const uy = dy / distance;
        a.x -= ux * push;
        a.y -= uy * push;
        b.x += ux * push;
        b.y += uy * push;
        moved = true;
      }
    }
    for (const point of placed) {
      point.x = Math.min(Math.max(point.x, gap / 2), box.x - gap / 2);
      point.y = Math.min(Math.max(point.y, gap / 2), box.y - gap / 2);
    }
    if (!moved) break;
  }
  return placed;
}

/**
 * The alliance's associations on the drawn territory, across the full
 * width, and below it as a grid of cards. A marker per zone (pushed apart,
 * with a hairline to its point, when two would overlap). Pointing at one
 * previews its associations as stacked cards beside it; clicking or tapping
 * pins them until closed. On phones the cards follow the map. Pointing at a
 * card in the grid lights its marker.
 * Positions are approximate zones, never addresses.
 */
function AssociationDirectory({
  associations,
  map,
}: AssociationDirectoryProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  // The zone of the grid card under the pointer: it only lights that
  // zone's marker, without opening its cards or lighting its neighbours.
  const [pointedCardZone, setPointedCardZone] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [wide, setWide] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const graceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const preview = (slug: string | null) => {
    clearTimeout(graceTimer.current);
    setHovered(slug);
  };
  // Leaving a marker or the preview waits a moment: crossing the gap
  // between them must not close the cards the pointer is heading to.
  const endPreview = () => {
    clearTimeout(graceTimer.current);
    graceTimer.current = setTimeout(() => setHovered(null), PREVIEW_GRACE_MS);
  };
  const enterMarker = (slug: string) => {
    clearTimeout(graceTimer.current);
    if (hovered && hovered !== slug) {
      graceTimer.current = setTimeout(() => setHovered(slug), SWITCH_INTENT_MS);
    } else {
      setHovered(slug);
    }
  };

  useEffect(() => () => clearTimeout(graceTimer.current), []);

  // The map's size in pixels and the marker size in use (36px from 640px,
  // 24px below), to keep markers from overlapping.
  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;
    const query = window.matchMedia("(min-width: 640px)");
    const onQuery = () => setWide(query.matches);
    onQuery();
    query.addEventListener("change", onQuery);
    const observer = new ResizeObserver(([entry]) =>
      setBox({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(element);
    return () => {
      query.removeEventListener("change", onQuery);
      observer.disconnect();
    };
  }, []);

  const groups = territoryZones
    .map((zone) => ({
      zone,
      members: associations.filter(
        (association) => association.zone === zone.slug,
      ),
    }))
    .filter(({ members }) => members.length > 0);
  const markerSize = wide ? 36 : 24;
  const truePoints = groups.map(({ zone }) => {
    const { left, top } = territoryPercent(zone.lat, zone.lon);
    return { x: (left / 100) * box.width, y: (top / 100) * box.height };
  });
  const measured = box.width > 0;
  const placedPoints = measured
    ? // Room for the chosen marker, which grows by a quarter.
      spreadMarkers(truePoints, markerSize * 1.25 + 8, {
        x: box.width,
        y: box.height,
      })
    : truePoints;
  const zones = groups.map((group, index) => ({
    ...group,
    point: truePoints[index],
    marker: placedPoints[index],
  }));
  const shown = zones.find(({ zone }) => zone.slug === (pinned ?? hovered));

  // A pinned zone closes with Escape or a click anywhere off its cards,
  // the map included. A click on a marker is left to the marker, which
  // switches zones or closes its own.
  useEffect(() => {
    if (!pinned) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element;
      if (target.closest(`#${PANEL_ID}, [aria-controls="${PANEL_ID}"]`)) {
        return;
      }
      setPinned(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [pinned]);

  const onMapKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && pinned) {
      const marker = document.getElementById(`marcador-${pinned}`);
      setPinned(null);
      marker?.focus();
    }
  };

  // Before measuring, markers sit on their point in percent of the map.
  const at = ({ x, y }: Point, fallback: { left: number; top: number }) =>
    measured
      ? { left: x, top: y }
      : { left: `${fallback.left}%`, top: `${fallback.top}%` };

  return (
    <div className="space-y-12 md:space-y-16">
      <figure>
        {/* The cards are placed against this box: on wide screens beside
            their marker (the box is exactly the map's size), on phones they
            follow the map. */}
        <div onKeyDown={onMapKeyDown} className="relative">
          <div
            ref={boxRef}
            className="relative"
            style={{ aspectRatio: territoryAspectRatio }}
          >
            {map}

            {/* Hairlines from moved markers back to their point. */}
            {measured ? (
              <svg
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              >
                {zones.map(({ zone, point, marker }) =>
                  Math.hypot(marker.x - point.x, marker.y - point.y) > 2 ? (
                    <g key={zone.slug} className="text-foreground">
                      <line
                        x1={point.x}
                        y1={point.y}
                        x2={marker.x}
                        y2={marker.y}
                        stroke="currentColor"
                        strokeOpacity="0.55"
                        strokeWidth="1"
                      />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="2.5"
                        fill="currentColor"
                      />
                    </g>
                  ) : null,
                )}
              </svg>
            ) : null}

            <ul aria-label="Zonas del mapa">
              {zones.map(({ zone, members, marker }) => {
                const isShown =
                  zone.slug === shown?.zone.slug ||
                  zone.slug === pointedCardZone;
                const fallback = territoryPercent(zone.lat, zone.lon);
                // Named on the map only where no other marker crowds it.
                const isolated =
                  measured &&
                  zones.every(
                    (other) =>
                      other.zone.slug === zone.slug ||
                      Math.hypot(
                        other.marker.x - marker.x,
                        other.marker.y - marker.y,
                      ) >
                        markerSize * 3,
                  );
                // Near the right edge there is no room beside it: above.
                const labelAbove = marker.x > box.width * 0.78;
                return (
                  <li key={zone.slug}>
                    <button
                      id={`marcador-${zone.slug}`}
                      type="button"
                      aria-label={`${zone.name}: ${members.length === 1 ? "1 asociación" : `${members.length} asociaciones`}`}
                      aria-expanded={pinned === zone.slug}
                      aria-controls={PANEL_ID}
                      onClick={() =>
                        setPinned((current) =>
                          current === zone.slug ? null : zone.slug,
                        )
                      }
                      onMouseEnter={() => enterMarker(zone.slug)}
                      onMouseLeave={endPreview}
                      onFocus={() => preview(zone.slug)}
                      onBlur={() => preview(null)}
                      style={at(marker, fallback)}
                      className={cn(
                        "bg-primary text-primary-foreground absolute z-10 flex size-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs font-bold shadow-[0_2px_8px_oklch(0_0_0/0.25)] transition-transform duration-200 ease-out motion-reduce:transition-none sm:size-9 sm:text-sm",
                        isShown && "outline-foreground scale-125 outline-2",
                      )}
                    >
                      {members.length}
                    </button>
                    {isolated ? (
                      <span
                        aria-hidden
                        style={at(marker, fallback)}
                        className={cn(
                          "font-editorial pointer-events-none absolute hidden -translate-y-1/2 text-[0.9375rem] whitespace-nowrap italic [text-shadow:0_0_3px_var(--card),0_0_3px_var(--card),0_0_3px_var(--card)] sm:block",
                          labelAbove
                            ? "-translate-x-1/2 -translate-y-[calc(100%+1.25rem)]"
                            : "translate-x-6",
                        )}
                      >
                        {zone.name}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>

          {shown ? (
            <ZoneStack
              group={shown}
              marker={shown.marker}
              box={box}
              pinned={pinned === shown.zone.slug}
              onClose={() => setPinned(null)}
              // Moving onto the preview keeps it open, so its links can be
              // reached with the pointer.
              onMouseEnter={() => preview(shown.zone.slug)}
              onMouseLeave={endPreview}
            />
          ) : null}
        </div>

        <figcaption className="text-muted-foreground mt-3 text-xs">
          Zonas aproximadas. Fuentes: CORPOREFUGIO (2025) y ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            className="underline underline-offset-2"
          >
            OpenStreetMap
          </a>
          .
        </figcaption>
      </figure>

      <section aria-labelledby="todas-titulo">
        <h2
          id="todas-titulo"
          className="font-sign border-b pb-4 text-[2rem] leading-none uppercase md:text-[2.5rem]"
        >
          Todas las asociaciones
        </h2>
        <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {associations.map((association) => (
            <AssociationCard
              key={association.slug}
              association={association}
              lit={
                association.zone !== null &&
                association.zone === (pinned ?? hovered)
              }
              onPoint={setPointedCardZone}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

/** Card width on wide screens, and its distance from the marker. */
const STACK_WIDTH = 320;
const STACK_GAP = 24;

/**
 * A zone's associations as stacked cards. Wide screens: beside its marker,
 * opening towards the side with more room and kept inside the map (it may
 * cover other markers while open). Phones: under the map.
 */
function ZoneStack({
  group: { zone, members },
  marker,
  box,
  pinned,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  group: { zone: TerritoryZone; members: DirectoryAssociation[] };
  marker: Point;
  box: { width: number; height: number };
  pinned: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  // Header and one row per association, a little generous.
  const height = 96 + members.length * 104;
  const toLeft = marker.x > box.width / 2;
  const left = toLeft
    ? marker.x - STACK_GAP - STACK_WIDTH
    : marker.x + STACK_GAP;
  const top = Math.min(
    Math.max(marker.y - STACK_GAP, 0),
    Math.max(box.height - height, 0),
  );

  return (
    <section
      id={PANEL_ID}
      aria-label={`Asociaciones en ${zone.name}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      // Static under the map on phones, where left and top do nothing.
      style={{ left: Math.max(left, 0), top }}
      className="bg-card z-20 mt-4 border shadow-[0_18px_48px_oklch(0_0_0/0.22)] sm:absolute sm:mt-0 sm:w-80"
    >
      <header className="flex items-start justify-between gap-3 border-b px-4 pt-3 pb-3">
        <div className="min-w-0">
          <p className="font-editorial text-lg leading-snug font-semibold">
            {zone.name}
          </p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {formatZoneDistance(zone)}
          </p>
        </div>
        {pinned ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-muted-foreground hover:text-foreground -mt-1 -mr-2 inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
          >
            <X aria-hidden className="size-4" />
          </button>
        ) : null}
      </header>
      <ul className="divide-y">
        {members.map((association) => (
          <li
            key={association.slug}
            className="group relative grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 px-4 py-3"
          >
            <Cover association={association} sizes="88px" small />
            <div className="min-w-0">
              <p className="font-editorial leading-snug font-semibold wrap-anywhere">
                <Link
                  href={association.href}
                  className="decoration-primary decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0"
                >
                  {association.name}
                </Link>
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {formatProductCount(association.productCount)}
              </p>
              <p className="text-primary mt-1 inline-flex items-center gap-1 text-sm font-semibold">
                Ver asociación
                <ArrowRight aria-hidden className="size-3.5" />
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Cover({
  association,
  sizes,
  small = false,
}: {
  association: DirectoryAssociation;
  sizes: string;
  small?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-muted relative aspect-4/3 overflow-hidden",
        small ? "self-start" : "w-full",
      )}
    >
      {association.coverUrl ? (
        <Image
          src={association.coverUrl}
          alt=""
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 p-2 text-center">
          <AromaLogo variant="symbol" className={small ? "w-7" : "w-12"} />
          {small ? null : (
            <span className="text-muted-foreground text-sm font-semibold">
              Foto en camino
            </span>
          )}
        </div>
      )}
      {association.logoUrl ? (
        <span
          className={cn(
            "bg-card absolute overflow-hidden rounded-full border shadow-[0_2px_10px_oklch(0_0_0/0.2)]",
            small ? "bottom-1 left-1 size-6" : "bottom-3 left-3 size-14",
          )}
        >
          <Image
            src={association.logoUrl}
            alt=""
            fill
            sizes={small ? "24px" : "56px"}
            className="object-contain p-1"
          />
        </span>
      ) : null}
    </div>
  );
}

/** An association in the grid, like the home's producer cards. */
function AssociationCard({
  association,
  lit,
  onPoint,
}: {
  association: DirectoryAssociation;
  lit: boolean;
  onPoint: (zone: string | null) => void;
}) {
  const zone = getTerritoryZone(association.zone);

  return (
    <li
      onMouseEnter={() => onPoint(zone?.slug ?? null)}
      onMouseLeave={() => onPoint(null)}
      onFocus={() => onPoint(zone?.slug ?? null)}
      onBlur={() => onPoint(null)}
      className="group has-[a:focus-visible]:outline-ring relative flex min-w-0 flex-col has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4"
    >
      <Cover
        association={association}
        sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
      />
      <span
        aria-hidden
        className={cn(
          "group-hover:bg-border mt-3 block h-[3px] transition-colors",
          lit ? "bg-foreground" : "bg-transparent",
        )}
      />
      <h3 className="font-editorial mt-2 text-xl leading-snug font-semibold wrap-anywhere">
        <Link
          href={association.href}
          className="decoration-primary decoration-2 underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0"
        >
          {association.name}
        </Link>
      </h3>
      {zone ? (
        <p className="mt-1 text-sm leading-snug">
          <span className="font-editorial text-base italic">{zone.name}</span>
          <span className="text-muted-foreground">
            {" "}
            · {formatZoneDistance(zone)}
          </span>
        </p>
      ) : association.location ? (
        <p className="font-editorial mt-1 italic">{association.location}</p>
      ) : null}
      {association.description ? (
        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
          {association.description}
        </p>
      ) : null}
      <p className="mt-2 text-sm font-semibold">
        {formatProductCount(association.productCount)}
      </p>
    </li>
  );
}

export { AssociationDirectory };
