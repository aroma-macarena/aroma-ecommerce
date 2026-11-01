/** Accepted image formats, recognized by their first bytes, not the name. */
const imageSignatures = [
  {
    type: "image/jpeg",
    extension: "jpg",
    matches: startsWith([0xff, 0xd8, 0xff]),
  },
  {
    type: "image/png",
    extension: "png",
    matches: startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  {
    type: "image/webp",
    extension: "webp",
    matches: (bytes: Uint8Array) =>
      ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP",
  },
] as const;

export type ImageFormat = (typeof imageSignatures)[number];

/** Size limit for an image once the browser has reduced it. */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const MAX_IMAGES_PER_PRODUCT = 8;

function startsWith(signature: number[]) {
  return (bytes: Uint8Array) =>
    signature.every((byte, index) => bytes[index] === byte);
}

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.subarray(start, end));
}

export function detectImageFormat(bytes: Uint8Array) {
  return imageSignatures.find(({ matches }) => matches(bytes)) ?? null;
}

/**
 * Object key for a product image: `products/{productId}/{uuid}.{extension}`.
 * Grouped by product and never reused, so keys cannot collide.
 */
export function productImageKey(productId: string, extension: string) {
  return `products/${productId}/${crypto.randomUUID()}.${extension}`;
}
