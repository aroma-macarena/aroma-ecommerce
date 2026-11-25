/**
 * Builds src/content/territory-map.ts (shapes) and territory-frame.ts (frame
 * and projection), the drawn map of La Macarena used by the association
 * directory and profiles, from OpenStreetMap data (© OpenStreetMap
 * contributors, ODbL).
 *
 * Download the three inputs once from the Overpass API into a folder and
 * pass it as the only argument (`pnpm map:build <folder>`):
 *
 *   munis.json   relation(id:11372667,7229667,7229628,11372871,11372668);
 *                out geom;
 *   parks.json   relation["boundary"="national_park"]
 *                ["name"~"Macarena|Tinigua",i](1.4,-75.2,3.2,-73.0);out geom;
 *   rivers.json  way["waterway"="river"]
 *                ["name"~"Guayabero|Losada|Duda",i](1.4,-75.2,3.2,-73.0);
 *                out geom;
 *
 * The output is committed; rerun only to change the drawing.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { format, resolveConfig } from "prettier";

type Point = [x: number, y: number];
type LonLat = [lon: number, lat: number];

type OsmGeometry = { lat: number; lon: number }[];
type OsmElement = {
  type: "node" | "way" | "relation";
  tags?: Record<string, string>;
  geometry?: OsmGeometry;
  members?: { type: string; role?: string; geometry?: OsmGeometry }[];
};

// Map frame: La Macarena municipality with a margin, in degrees.
const WEST = -74.8;
const EAST = -73.38;
const SOUTH = 1.55;
const NORTH = 2.72;
const WIDTH = 1000; // viewBox units
const LAT_MID = (SOUTH + NORTH) / 2;
const COS_LAT = Math.cos((LAT_MID * Math.PI) / 180);
const X_SCALE = WIDTH / ((EAST - WEST) * COS_LAT);
const HEIGHT = Math.round((NORTH - SOUTH) * X_SCALE);
const TOLERANCE = 1.2; // simplification, in viewBox units

/**
 * Only the rivers that shape the alliance's territory; others (the Yarí,
 * the Ariari) would show as stray strokes at the frame's edges.
 */
const KEPT_RIVERS = new Set(["Río Guayabero", "Río Losada", "Río Duda"]);

function project([lon, lat]: LonLat): Point {
  return [(lon - WEST) * COS_LAT * X_SCALE, (NORTH - lat) * X_SCALE];
}

/** Douglas-Peucker on projected points. */
function simplify(points: Point[], tolerance = TOLERANCE): Point[] {
  if (points.length < 3) return points;
  const [x1, y1] = points[0];
  const [x2, y2] = points[points.length - 1];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1e-9;
  let index = 0;
  let distance = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const [px, py] = points[i];
    const d = Math.abs(dy * px - dx * py + x2 * y1 - y2 * x1) / length;
    if (d > distance) {
      index = i;
      distance = d;
    }
  }
  if (distance <= tolerance) return [points[0], points[points.length - 1]];
  const left = simplify(points.slice(0, index + 1), tolerance);
  const right = simplify(points.slice(index), tolerance);
  return [...left.slice(0, -1), ...right];
}

const same = (a: LonLat, b: LonLat) => a[0] === b[0] && a[1] === b[1];

/** Joins a relation's outer ways into closed rings. */
function stitch(ways: LonLat[][]) {
  const segments = ways.filter((way) => way.length > 1).map((way) => [...way]);
  const rings: LonLat[][] = [];
  while (segments.length > 0) {
    let ring = segments.shift()!;
    let changed = true;
    while (changed && !same(ring[0], ring[ring.length - 1])) {
      changed = false;
      for (let i = 0; i < segments.length; i += 1) {
        const segment = segments[i];
        const first = segment[0];
        const last = segment[segment.length - 1];
        if (same(first, ring[ring.length - 1])) {
          ring = [...ring, ...segment.slice(1)];
        } else if (same(last, ring[ring.length - 1])) {
          ring = [...ring, ...[...segment].reverse().slice(1)];
        } else if (same(last, ring[0])) {
          ring = [...segment.slice(0, -1), ...ring];
        } else if (same(first, ring[0])) {
          ring = [...[...segment].reverse().slice(0, -1), ...ring];
        } else {
          continue;
        }
        segments.splice(i, 1);
        changed = true;
        break;
      }
    }
    rings.push(ring);
  }
  return rings;
}

function svgPath(points: LonLat[], closed: boolean) {
  const projected = points.map(project);
  let simplified: Point[];
  if (closed && projected.length > 3) {
    // A ring starts and ends on the same point, which would collapse the
    // simplification's baseline: simplify its two halves instead.
    const middle = Math.floor(projected.length / 2);
    simplified = [
      ...simplify(projected.slice(0, middle + 1)),
      ...simplify(projected.slice(middle)).slice(1),
    ];
  } else {
    simplified = simplify(projected);
  }
  if (simplified.length < 2) return "";
  const [head, ...rest] = simplified;
  const at = ([x, y]: Point) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  return `M${at(head)}${rest.map((point) => `L${at(point)}`).join("")}${closed ? "Z" : ""}`;
}

const toLonLat = (geometry: OsmGeometry) =>
  geometry.map(({ lon, lat }): LonLat => [lon, lat]);

function relationPaths(element: OsmElement) {
  const ways = (element.members ?? [])
    .filter(
      (member) =>
        member.type === "way" &&
        (member.role === "outer" || member.role === "") &&
        member.geometry,
    )
    .map((member) => toLonLat(member.geometry!));
  return stitch(ways)
    .map((ring) => svgPath(ring, true))
    .join("");
}

async function readElements(folder: string, file: string) {
  const json = JSON.parse(await readFile(path.join(folder, file), "utf8"));
  return json.elements as OsmElement[];
}

function entries(record: Record<string, string>) {
  return Object.entries(record)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([name, d]) => `    ${JSON.stringify(name)}: ${JSON.stringify(d)},`);
}

async function main(folder: string | undefined) {
  if (!folder) {
    throw new Error("Usage: pnpm map:build <folder with the OSM json files>");
  }

  const [munis, parks, rivers] = await Promise.all([
    readElements(folder, "munis.json"),
    readElements(folder, "parks.json"),
    readElements(folder, "rivers.json"),
  ]);

  const municipalities: Record<string, string> = {};
  for (const element of munis) {
    municipalities[element.tags!.name] = relationPaths(element);
  }

  const protectedAreas: Record<string, string> = {};
  for (const element of parks) {
    if (
      element.type === "relation" &&
      element.tags?.boundary === "national_park"
    ) {
      protectedAreas[element.tags.name] = relationPaths(element);
    }
  }

  const riverPaths: Record<string, string> = {};
  for (const element of rivers) {
    const name = element.tags!.name.split(" - ")[0].split(" (")[0];
    if (!KEPT_RIVERS.has(name) || !element.geometry) continue;
    riverPaths[name] =
      (riverPaths[name] ?? "") + svgPath(toLonLat(element.geometry), false);
  }

  const header = [
    "// Generated by scripts/build-territory-map.ts from OpenStreetMap data",
    "// (© OpenStreetMap contributors, ODbL). Do not edit by hand.",
    "",
  ];
  // The frame and projection are tiny and used by client code; the shapes
  // are drawn on the server only, so they live in a file of their own.
  const frame = [
    ...header,
    "/** The drawn frame, in viewBox units, and how to place a point in it. */",
    `export const territoryViewBox = { width: ${WIDTH}, height: ${HEIGHT} } as const;`,
    "",
    "const frame = {",
    `  west: ${WEST},`,
    `  north: ${NORTH},`,
    `  cosLat: ${COS_LAT},`,
    `  scale: ${X_SCALE},`,
    "} as const;",
    "",
    "/** viewBox units per kilometre (the projection keeps them equal on both axes). */",
    "export const territoryUnitsPerKm = frame.scale / 110.574;",
    "",
    "/** Longitude and latitude to viewBox coordinates. */",
    "export function projectToTerritory(lat: number, lon: number) {",
    "  return {",
    "    x: (lon - frame.west) * frame.cosLat * frame.scale,",
    "    y: (frame.north - lat) * frame.scale,",
    "  };",
    "}",
    "",
  ];
  const shapes = [
    ...header,
    "export const territoryShapes = {",
    "  municipalities: {",
    ...entries(municipalities),
    "  },",
    "  parks: {",
    ...entries(protectedAreas),
    "  },",
    "  rivers: {",
    ...entries(riverPaths),
    "  },",
    "} as const;",
    "",
  ];

  // pnpm runs scripts from the repository's root.
  const content = path.resolve("src/content");
  for (const [file, lines] of [
    ["territory-frame.ts", frame],
    ["territory-map.ts", shapes],
  ] as const) {
    const target = path.join(content, file);
    const options = await resolveConfig(target);
    await writeFile(
      target,
      await format(lines.join("\n"), { ...options, filepath: target }),
    );
    console.log(`wrote ${path.relative(process.cwd(), target)}`);
  }
  console.log(`viewBox ${WIDTH}x${HEIGHT}`);
}

main(process.argv[2]).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
