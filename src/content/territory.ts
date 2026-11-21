/**
 * Zones of the alliance's territory where an association can be placed on
 * the directory's map. Deliberately approximate: a vereda or a populated
 * centre, never a household or a farm.
 *
 * Sources: the veredas and distances come from the map «Fortalecimiento
 * de los procesos organizativos de mujeres líderes en La Macarena»
 * (CORPOREFUGIO, 15.08.2025). Positions come from OpenStreetMap places where
 * they exist (casco urbano, El Billar, Cristalina del Losada, San Juan de
 * Losada, El Porvenir) and, otherwise, from that map's vereda labels.
 */
export const territoryZones = [
  {
    slug: "casco-urbano",
    name: "Casco urbano de La Macarena",
    lat: 2.1834,
    lon: -73.7858,
    distanceKm: 0,
  },
  {
    slug: "el-billar",
    name: "Vereda El Billar",
    lat: 2.2212,
    lon: -73.8217,
    distanceKm: 8,
  },
  {
    slug: "la-esperanza",
    name: "Vereda La Esperanza",
    lat: 2.107,
    lon: -73.843,
    distanceKm: 24,
  },
  {
    slug: "el-palmar",
    name: "Vereda El Palmar",
    lat: 2.19,
    lon: -73.48,
    distanceKm: 24,
  },
  {
    slug: "el-jordan",
    name: "Vereda El Jordán",
    lat: 1.957,
    lon: -73.669,
    distanceKm: 24,
  },
  {
    slug: "cano-indio",
    name: "Vereda Caño Indio",
    lat: 2.33,
    lon: -73.76,
    distanceKm: 30,
  },
  {
    slug: "alto-raudal",
    name: "Vereda Alto Raudal",
    lat: 2.305,
    lon: -73.994,
    distanceKm: 30,
  },
  {
    slug: "cristalina-del-losada",
    name: "Cristalina del Losada",
    lat: 2.1658,
    lon: -74.2748,
    distanceKm: 70,
  },
  {
    slug: "porvenir",
    name: "Vereda Porvenir",
    lat: 1.9737,
    lon: -74.3567,
    distanceKm: 80,
  },
  {
    slug: "san-juan-de-losada",
    name: "San Juan de Losada",
    lat: 2.2438,
    lon: -74.4512,
    distanceKm: 100,
  },
] as const;

export type TerritoryZone = (typeof territoryZones)[number];
export type TerritoryZoneSlug = TerritoryZone["slug"];

export const territoryZoneSlugs = territoryZones.map(({ slug }) => slug) as [
  TerritoryZoneSlug,
  ...TerritoryZoneSlug[],
];

export function getTerritoryZone(slug: string | null) {
  return territoryZones.find((zone) => zone.slug === slug) ?? null;
}

/** «70 km de La Macarena» or «En el casco urbano». */
export function formatZoneDistance(zone: TerritoryZone) {
  return zone.distanceKm === 0
    ? "En el casco urbano"
    : `${zone.distanceKm} km de La Macarena`;
}
