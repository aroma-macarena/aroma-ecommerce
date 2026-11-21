import {
  projectToTerritory,
  territoryUnitsPerKm,
  territoryViewBox,
} from "@/content/territory-frame";
import { territoryShapes } from "@/content/territory-map";
import { townPosition } from "@/lib/territory-geometry";

const { width, height } = territoryViewBox;

/** Places where a label helps read the drawing, in latitude/longitude. */
const placeLabels = [
  { text: "Uribe", lat: 2.66, lon: -74.55, kind: "municipality" },
  { text: "Mesetas", lat: 2.665, lon: -74.12, kind: "municipality" },
  { text: "Vista Hermosa", lat: 2.66, lon: -73.62, kind: "municipality" },
  { text: "PNN Tinigua", lat: 2.5, lon: -74.2, kind: "park" },
  { text: "PNN Sierra de La Macarena", lat: 2.56, lon: -73.86, kind: "park" },
  { text: "Río Guayabero", lat: 2.21, lon: -74.05, kind: "river" },
  { text: "Río Losada", lat: 2.42, lon: -74.66, kind: "river" },
] as const;

/**
 * Straight-line distance from the town, with the angle (degrees, clockwise
 * from east) where each ring is labelled: the empty savanna to the
 * south-west, away from the river corridor where the zones are.
 */
const distanceRings = [
  { km: 25, labelAngle: 135 },
  { km: 50, labelAngle: 135 },
  { km: 100, labelAngle: 150 },
] as const;

/**
 * The drawn territory of La Macarena from OpenStreetMap data: the
 * municipality on white, its neighbours in mist, the two national parks
 * hatched, the rivers in worn ink, rings of straight-line distance from the
 * town and the town as a small square. Rendered on the server; purely
 * decorative, since the markers and the list tell what it locates.
 */
function TerritoryMap() {
  const town = projectToTerritory(townPosition.lat, townPosition.lon);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className="block h-auto w-full"
    >
      <defs>
        <pattern
          id="territorio-parque"
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="9"
            className="stroke-foreground/15"
            strokeWidth="1.5"
          />
        </pattern>
      </defs>

      {Object.entries(territoryShapes.municipalities).map(([name, d]) => (
        <path
          key={name}
          d={d}
          className={
            name === "La Macarena"
              ? "fill-card stroke-foreground"
              : "fill-muted stroke-border"
          }
          strokeWidth={name === "La Macarena" ? 1.5 : 1}
          strokeLinejoin="round"
        />
      ))}

      {Object.entries(territoryShapes.parks).map(([name, d]) => (
        <path
          key={name}
          d={d}
          fill="url(#territorio-parque)"
          className="stroke-foreground/25"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
      ))}

      {/* The municipality's outline again, over the parks' hatching. */}
      <path
        d={territoryShapes.municipalities["La Macarena"]}
        fill="none"
        className="stroke-foreground"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {Object.entries(territoryShapes.rivers).map(([name, d]) => (
        <path
          key={name}
          d={d}
          fill="none"
          className="stroke-muted-foreground/60"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {distanceRings.map(({ km, labelAngle }) => {
        const radius = km * territoryUnitsPerKm;
        const angle = (labelAngle * Math.PI) / 180;
        return (
          // Unlabelled on phones, where they would say nothing.
          <g key={km} className="hidden sm:inline">
            <circle
              cx={town.x}
              cy={town.y}
              r={radius}
              fill="none"
              className="stroke-foreground/30"
              strokeWidth="1"
              strokeDasharray="2 5"
              strokeLinecap="round"
            />
            <text
              x={town.x + Math.cos(angle) * radius}
              y={town.y + Math.sin(angle) * radius + 5}
              textAnchor="middle"
              paintOrder="stroke"
              strokeWidth="6"
              strokeLinejoin="round"
              className="fill-muted-foreground stroke-card hidden font-sans text-[14px] font-semibold sm:inline"
            >
              {km} km
            </text>
          </g>
        );
      })}

      {placeLabels.map(({ text, lat, lon, kind }) => {
        const { x, y } = projectToTerritory(lat, lon);
        return (
          <text
            key={text}
            x={x}
            y={y}
            textAnchor="middle"
            // Too small to read on phones, where only the town is named.
            className={
              kind === "municipality"
                ? "fill-muted-foreground hidden font-sans text-[15px] font-semibold tracking-[0.04em] uppercase sm:inline"
                : "fill-muted-foreground font-editorial hidden text-[17px] italic sm:inline"
            }
          >
            {text}
          </text>
        );
      })}

      <rect
        x={town.x - 5}
        y={town.y - 5}
        width="10"
        height="10"
        className="fill-foreground"
      />
      {/* To the town's right, clear of the markers that cluster around it. */}
      <text
        x={town.x + 26}
        y={town.y + 7}
        className="fill-foreground font-editorial text-[30px] font-semibold sm:text-[20px]"
      >
        La Macarena
      </text>
    </svg>
  );
}

export { TerritoryMap };
