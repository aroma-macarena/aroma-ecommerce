import { describe, expect, it } from "vitest";

import {
  formatPresentationDetails,
  formatPresentationSize,
  formatReferencePrice,
} from "@/lib/presentation-format";

describe("presentation formatting", () => {
  it("formats sizes without trailing decimals", () => {
    expect(formatPresentationSize({ quantity: "250.000", unit: "g" })).toBe(
      "250 g",
    );
    expect(formatPresentationSize({ quantity: "1.500", unit: "kg" })).toBe(
      "1,5 kg",
    );
    expect(formatPresentationSize({ quantity: null, unit: "frasco" })).toBe(
      "frasco",
    );
  });

  it("formats prices in whole pesos", () => {
    expect(formatReferencePrice("25000.00")?.replace(/\s/g, " ")).toBe(
      "$ 25.000",
    );
    expect(formatReferencePrice(null)).toBeNull();
  });

  it("joins size and price, skipping what is missing", () => {
    expect(
      formatPresentationDetails({
        quantity: "250",
        unit: "g",
        referencePrice: null,
      }),
    ).toBe("250 g");
    expect(
      formatPresentationDetails({
        quantity: null,
        unit: null,
        referencePrice: null,
      }),
    ).toBe("");
  });
});
