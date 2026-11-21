import {
  projectToTerritory,
  territoryViewBox,
} from "@/content/territory-frame";

const { width, height } = territoryViewBox;

/** The map's proportions, for the box that holds it. */
export const territoryAspectRatio = `${width} / ${height}`;

/** Converts a point to percentages of the drawing, for HTML overlays. */
export function territoryPercent(lat: number, lon: number) {
  const { x, y } = projectToTerritory(lat, lon);
  return { left: (x / width) * 100, top: (y / height) * 100 };
}

/** The town of La Macarena, centre of the distance rings. */
export const townPosition = { lat: 2.1834, lon: -73.7858 } as const;
