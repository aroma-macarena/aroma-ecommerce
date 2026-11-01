import { describe, expect, it } from "vitest";

import {
  parsePresentationForm,
  toPresentationFormValues,
} from "@/lib/admin/presentation-form";

function parse(values: Record<string, string>) {
  return parsePresentationForm({ name: "Bolsa", isAvailable: "on", ...values });
}

describe("parsePresentationForm", () => {
  it("accepts a name alone and leaves the rest empty", () => {
    expect(parse({})).toEqual({
      success: true,
      data: {
        name: "Bolsa",
        quantity: null,
        unit: null,
        referencePrice: null,
        isAvailable: true,
      },
    });
  });

  it("requires a name", () => {
    expect(parse({ name: "  " })).toMatchObject({
      success: false,
      fieldErrors: { name: expect.any(String) },
    });
  });

  it("accepts decimal quantities with a comma or a dot", () => {
    expect(parse({ quantity: "1,5" })).toMatchObject({
      data: { quantity: "1.5" },
    });
    expect(parse({ quantity: "0.250" })).toMatchObject({
      data: { quantity: "0.250" },
    });
  });

  it("rejects zero, negative and malformed quantities", () => {
    for (const quantity of ["0", "-1", "1,2345", "dos"]) {
      expect(parse({ quantity })).toMatchObject({
        success: false,
        fieldErrors: { quantity: expect.any(String) },
      });
    }
  });

  it("reads whole pesos with or without thousands separators", () => {
    for (const referencePrice of ["18000", "18.000", "$ 18.000", "18 000"]) {
      expect(parse({ referencePrice })).toMatchObject({
        data: { referencePrice: "18000" },
      });
    }
    expect(parse({ referencePrice: "0" })).toMatchObject({
      data: { referencePrice: "0" },
    });
  });

  it("rejects cents, negative and ambiguous prices", () => {
    for (const referencePrice of ["18000,50", "-500", "18.5", "1.8000"]) {
      expect(parse({ referencePrice })).toMatchObject({
        success: false,
        fieldErrors: { referencePrice: expect.any(String) },
      });
    }
  });

  it("reads availability from the checkbox", () => {
    expect(parse({ isAvailable: "" })).toMatchObject({
      data: { isAvailable: false },
    });
  });
});

describe("toPresentationFormValues", () => {
  it("shows stored amounts as the form expects them", () => {
    expect(
      toPresentationFormValues({
        name: "Bolsa",
        quantity: "1.500",
        unit: "kg",
        referencePrice: "25000.00",
        isAvailable: false,
      }),
    ).toEqual({
      name: "Bolsa",
      quantity: "1,5",
      unit: "kg",
      referencePrice: "25000",
      isAvailable: "",
    });
  });
});
