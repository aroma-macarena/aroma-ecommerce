import { describe, expect, it } from "vitest";

import {
  detectImageFormat,
  productImageKey,
} from "@/lib/storage/product-images";

const bytes = (...values: number[]) => new Uint8Array(values);
const text = (value: string) => new TextEncoder().encode(value);

describe("detectImageFormat", () => {
  it("recognizes JPEG, PNG and WebP by their first bytes", () => {
    expect(detectImageFormat(bytes(0xff, 0xd8, 0xff, 0xe0))?.type).toBe(
      "image/jpeg",
    );
    expect(
      detectImageFormat(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))
        ?.extension,
    ).toBe("png");
    expect(detectImageFormat(text("RIFF\0\0\0\0WEBPVP8 "))?.type).toBe(
      "image/webp",
    );
  });

  it("rejects other files, whatever their name says", () => {
    expect(detectImageFormat(text("GIF89a"))).toBeNull();
    expect(detectImageFormat(text("<svg xmlns="))).toBeNull();
    expect(detectImageFormat(text("%PDF-1.7"))).toBeNull();
    expect(detectImageFormat(bytes())).toBeNull();
  });
});

describe("productImageKey", () => {
  it("groups keys by product and never repeats them", () => {
    const productId = "00000000-0000-4000-8000-0000000000aa";
    const first = productImageKey(productId, "webp");
    const second = productImageKey(productId, "webp");

    expect(first).toMatch(
      new RegExp(`^products/${productId}/[0-9a-f-]{36}\\.webp$`),
    );
    expect(first).not.toBe(second);
  });
});
