import { describe, expect, it } from "vitest";

import {
  projectToTerritory,
  territoryViewBox,
} from "@/content/territory-frame";

import {
  formatZoneSuffix,
  getTerritoryZone,
  territoryZones,
} from "./territory";

describe("territory zones", () => {
  it("all lie inside the drawn map", () => {
    for (const zone of territoryZones) {
      const { x, y } = projectToTerritory(zone.lat, zone.lon);
      expect(x, zone.slug).toBeGreaterThan(0);
      expect(x, zone.slug).toBeLessThan(territoryViewBox.width);
      expect(y, zone.slug).toBeGreaterThan(0);
      expect(y, zone.slug).toBeLessThan(territoryViewBox.height);
    }
  });

  it("leave the town without a distance, beside its own name", () => {
    const town = getTerritoryZone("casco-urbano")!;
    const billar = getTerritoryZone("el-billar")!;

    expect(formatZoneSuffix(town)).toBe("");
    expect(formatZoneSuffix(town, "zona aproximada")).toBe(
      " · zona aproximada",
    );
    expect(formatZoneSuffix(billar)).toBe(" · 8 km de La Macarena");
  });

  it("have unique slugs and resolve by them", () => {
    const slugs = territoryZones.map(({ slug }) => slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(getTerritoryZone("el-billar")?.name).toBe("Vereda El Billar");
    expect(getTerritoryZone("bogota")).toBeNull();
    expect(getTerritoryZone(null)).toBeNull();
  });
});
