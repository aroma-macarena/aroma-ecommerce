import { describe, expect, it } from "vitest";

import { nextAvailableSlug, slugCandidatePrefix, slugify } from "@/lib/slug";

describe("slugify", () => {
  it("removes accents, symbols and extra spaces", () => {
    expect(slugify("  Café de Origen — Ñame & Ají  ")).toBe(
      "cafe-de-origen-name-aji",
    );
  });

  it("returns an empty string when nothing usable remains", () => {
    expect(slugify("¿¡!?")).toBe("");
  });

  it("keeps slugs within 200 characters without a trailing hyphen", () => {
    const slug = slugify(`${"a".repeat(199)} b`);

    expect(slug.length).toBeLessThanOrEqual(200);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("nextAvailableSlug", () => {
  it("uses the base slug when it is free", () => {
    expect(nextAvailableSlug("cafe", ["miel"])).toBe("cafe");
  });

  it("adds the first free numeric suffix", () => {
    expect(nextAvailableSlug("cafe", ["cafe", "cafe-2", "cafe-4"])).toBe(
      "cafe-3",
    );
  });

  it("falls back to a generic slug for empty names", () => {
    expect(nextAvailableSlug("", [])).toBe("producto");
  });

  it("keeps suffixed slugs within 200 characters", () => {
    const base = "a".repeat(200);

    expect(nextAvailableSlug(base, [base])).toHaveLength(200);
  });
});

describe("slugCandidatePrefix", () => {
  it("is shared by suffixed candidates whose root was shortened", () => {
    const base = "a".repeat(200);
    const taken = [base, `${"a".repeat(198)}-2`];

    expect(nextAvailableSlug(base, taken)).toMatch(
      new RegExp(`^${slugCandidatePrefix(base)}`),
    );
    expect(
      taken.every((slug) => slug.startsWith(slugCandidatePrefix(base))),
    ).toBe(true);
  });

  it("falls back to the default root", () => {
    expect(slugCandidatePrefix("")).toBe("producto");
  });
});
