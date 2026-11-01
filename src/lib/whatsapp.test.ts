import { describe, expect, it } from "vitest";

import {
  getAssociationInquiryMessage,
  getProductInquiryMessage,
  getWhatsAppHref,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp";

describe("normalizeWhatsAppNumber", () => {
  it("keeps numbers that already have a country code", () => {
    expect(normalizeWhatsAppNumber("573001111111")).toBe("573001111111");
    expect(normalizeWhatsAppNumber("+57 300 111 1111")).toBe("573001111111");
  });

  it("adds Colombia's code to a 10-digit mobile number", () => {
    expect(normalizeWhatsAppNumber("300 111 1111")).toBe("573001111111");
  });

  it("treats empty or too short values as missing", () => {
    expect(normalizeWhatsAppNumber(null)).toBeNull();
    expect(normalizeWhatsAppNumber("  ")).toBeNull();
    expect(normalizeWhatsAppNumber("12345")).toBeNull();
  });
});

describe("getWhatsAppHref", () => {
  it("builds a wa.me link with the encoded message", () => {
    expect(getWhatsAppHref("573001111111", "Hola, ¿qué tal?")).toBe(
      "https://wa.me/573001111111?text=Hola%2C%20%C2%BFqu%C3%A9%20tal%3F",
    );
  });

  it("returns null without a number", () => {
    expect(getWhatsAppHref(undefined, "Hola")).toBeNull();
  });
});

describe("getProductInquiryMessage", () => {
  const message = getProductInquiryMessage({
    productName: "Café de la Sierra",
    associationName: "ASCAGY",
    productUrl: "https://aroma.example/productos/ascagy/cafe-de-la-sierra",
  });

  it("names the product and the association and links to it", () => {
    expect(message).toContain("«Café de la Sierra» de ASCAGY");
    expect(message).toContain(
      "https://aroma.example/productos/ascagy/cafe-de-la-sierra",
    );
  });

  it("asks about the product without claiming an order", () => {
    expect(message).toMatch(/me gustaría saber más/);
    expect(message).not.toMatch(/pedido|compré|orden/i);
  });

  it("leaves the link out when there is no site URL", () => {
    expect(
      getProductInquiryMessage({
        productName: "Miel",
        associationName: "AAMPY",
      }),
    ).not.toContain("http");
  });
});

describe("getAssociationInquiryMessage", () => {
  it("asks about the association's products and links to its profile", () => {
    const message = getAssociationInquiryMessage({
      associationName: "ASCAGY",
      associationUrl: "https://aroma.example/asociaciones/ascagy",
    });

    expect(message).toContain("conocí a ASCAGY");
    expect(message).toContain("sus productos");
    expect(message).toContain("https://aroma.example/asociaciones/ascagy");
    expect(message).not.toMatch(/pedido|orden/i);
  });
});
