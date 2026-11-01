/** Largest original the browser will try to reduce. */
export const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
/** Longest side of a product photo after reduction. */
export const PRODUCT_IMAGE_MAX_DIMENSION = 2000;
const QUALITY = 0.85;

export type ImageReductionErrorCode = "TOO_LARGE" | "UNREADABLE";

export class ImageReductionError extends Error {
  constructor(readonly code: ImageReductionErrorCode) {
    super(code);
    this.name = "ImageReductionError";
  }
}

export type ReducedImage = {
  file: File;
  width: number;
  height: number;
};

function toBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, QUALITY),
  );
}

/**
 * Redraws a photo at up to `maxDimension` px on its longest side (2000 by
 * default) and encodes it as
 * WebP (JPEG where the browser cannot encode WebP). Redrawing also drops the
 * file's metadata, such as the GPS location phones store in photos.
 */
export async function reduceImage(
  source: File,
  maxDimension = PRODUCT_IMAGE_MAX_DIMENSION,
): Promise<ReducedImage> {
  if (source.size > MAX_SOURCE_BYTES) {
    throw new ImageReductionError("TOO_LARGE");
  }

  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(source, {
      imageOrientation: "from-image",
    });
  } catch {
    throw new ImageReductionError("UNREADABLE");
  }

  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    throw new ImageReductionError("UNREADABLE");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  let blob = await toBlob(canvas, "image/webp");

  // Browsers that cannot encode WebP return PNG; JPEG is smaller for photos.
  if (!blob || blob.type !== "image/webp") {
    context.globalCompositeOperation = "destination-over";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    blob = await toBlob(canvas, "image/jpeg");
  }

  bitmap.close();

  if (!blob) {
    throw new ImageReductionError("UNREADABLE");
  }

  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  const name = `${source.name.replace(/\.[^.]+$/, "") || "imagen"}.${extension}`;

  return {
    file: new File([blob], name, { type: blob.type }),
    width,
    height,
  };
}
