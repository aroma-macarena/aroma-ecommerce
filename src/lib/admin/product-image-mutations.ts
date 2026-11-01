import { and, asc, count, eq, inArray, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { productImagesTable as productImages } from "@/db/schema/productImages";
import { displayOrderByPosition, moveInOrder } from "@/lib/admin/display-order";
import { withProductLock } from "@/lib/admin/product-lock";
import {
  getEditableProduct,
  recordProductChange,
} from "@/lib/admin/product-mutations";
import type { AdminProfile } from "@/lib/auth/get-current-profile";
import {
  detectImageFormat,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_PRODUCT,
  productImageKey,
} from "@/lib/storage/product-images";
import { getMediaStorage, MediaStorageError } from "@/lib/storage/r2";

export type ImageFieldErrors = Partial<Record<"file" | "altText", string>>;

export type ImageMutationResult =
  | { ok: true }
  | { ok: false; reason: "INVALID"; fieldErrors: ImageFieldErrors }
  | { ok: false; reason: "NOT_FOUND" | "LIMIT_REACHED" | "STORAGE_ERROR" };

import { MAX_ALT_TEXT_LENGTH } from "@/lib/admin/image-form";

const imageOrder = [
  asc(productImages.displayOrder),
  asc(productImages.createdAt),
  asc(productImages.id),
];

/** Images of a product, in display order. */
export async function getProductImages(productId: string) {
  return db
    .select({
      id: productImages.id,
      objectKey: productImages.objectKey,
      altText: productImages.altText,
      isPrimary: productImages.isPrimary,
      displayOrder: productImages.displayOrder,
    })
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(...imageOrder);
}

export type ProductImage = Awaited<ReturnType<typeof getProductImages>>[number];

/** An image of a product the profile may manage; otherwise null. */
export async function getEditableImage(
  profile: AdminProfile,
  productId: string,
  imageId: string,
) {
  const product = await getEditableProduct(profile, productId);

  if (!product) {
    return null;
  }

  const image = (await getProductImages(product.id)).find(
    ({ id }) => id === imageId,
  );

  return image ? { product, image } : null;
}

function normalizeAltText(altText: string) {
  const trimmed = altText.trim();

  if (trimmed.length > MAX_ALT_TEXT_LENGTH) {
    return {
      error: `El texto alternativo puede tener hasta ${MAX_ALT_TEXT_LENGTH} caracteres.`,
    };
  }

  return { value: trimmed || null };
}

/**
 * Stores the image in R2 and records its object key. The object is uploaded
 * first; if recording it fails, it is deleted so no orphan stays behind. The
 * first image of a product becomes its primary image.
 */
export async function uploadProductImage(
  profile: AdminProfile,
  productId: string,
  upload: { bytes: Uint8Array<ArrayBuffer>; altText: string },
): Promise<ImageMutationResult> {
  const product = await getEditableProduct(profile, productId);

  if (!product) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const fieldErrors: ImageFieldErrors = {};
  const format = detectImageFormat(upload.bytes);
  const altText = normalizeAltText(upload.altText);

  if (upload.bytes.length === 0) {
    fieldErrors.file = "Elige una imagen.";
  } else if (!format) {
    fieldErrors.file = "La imagen debe ser JPG, PNG o WebP.";
  } else if (upload.bytes.length > MAX_IMAGE_BYTES) {
    fieldErrors.file =
      "La imagen pesa más de 4 MB incluso después de reducirla.";
  }

  if ("error" in altText) {
    fieldErrors.altText = altText.error;
  }

  if (!format || Object.keys(fieldErrors).length > 0 || "error" in altText) {
    return { ok: false, reason: "INVALID", fieldErrors };
  }

  const [{ images }] = await db
    .select({ images: count() })
    .from(productImages)
    .where(eq(productImages.productId, product.id));

  if (images >= MAX_IMAGES_PER_PRODUCT) {
    return { ok: false, reason: "LIMIT_REACHED" };
  }

  const storage = getMediaStorage();
  const objectKey = productImageKey(product.id, format.extension);

  try {
    await storage.put(objectKey, upload.bytes, format.type);
  } catch (error) {
    if (error instanceof MediaStorageError) {
      return { ok: false, reason: "STORAGE_ERROR" };
    }
    throw error;
  }

  try {
    // Under the product lock, two first uploads cannot both become primary.
    await withProductLock(product.id, (executor) => [
      executor.insert(productImages).values({
        productId: product.id,
        objectKey,
        altText: altText.value,
        displayOrder: sql`(
          select coalesce(max(${productImages.displayOrder}) + 1, 0)
          from ${productImages}
          where ${productImages.productId} = ${product.id}
        )`,
        isPrimary: sql`not exists (
          select 1 from ${productImages}
          where ${productImages.productId} = ${product.id}
            and ${productImages.isPrimary}
        )`,
      }),
    ]);
  } catch (error) {
    await storage.delete(objectKey).catch(() => undefined);
    throw error;
  }

  await recordProductChange(profile, product.id);

  return { ok: true };
}

export async function updateImageAltText(
  profile: AdminProfile,
  productId: string,
  imageId: string,
  altText: string,
): Promise<ImageMutationResult> {
  const editable = await getEditableImage(profile, productId, imageId);

  if (!editable) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const normalized = normalizeAltText(altText);

  if ("error" in normalized) {
    return {
      ok: false,
      reason: "INVALID",
      fieldErrors: { altText: normalized.error },
    };
  }

  await db
    .update(productImages)
    .set({ altText: normalized.value, updatedAt: sql`now()` })
    .where(eq(productImages.id, editable.image.id));
  await recordProductChange(profile, editable.product.id);

  return { ok: true };
}

/**
 * Makes an image the product's primary one. The previous primary is cleared
 * first, in the same transaction, so the unique index on primary images is
 * never violated, not even for a moment.
 */
export async function setPrimaryImage(
  profile: AdminProfile,
  productId: string,
  imageId: string,
): Promise<ImageMutationResult> {
  const editable = await getEditableImage(profile, productId, imageId);

  if (!editable) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const { product, image } = editable;

  await withProductLock(product.id, (executor) => [
    executor
      .update(productImages)
      .set({ isPrimary: false, updatedAt: sql`now()` })
      .where(
        and(
          eq(productImages.productId, product.id),
          eq(productImages.isPrimary, true),
          ne(productImages.id, image.id),
        ),
      ),
    executor
      .update(productImages)
      .set({ isPrimary: true, updatedAt: sql`now()` })
      .where(
        and(
          eq(productImages.id, image.id),
          eq(productImages.productId, product.id),
        ),
      ),
  ]);
  await recordProductChange(profile, product.id);

  return { ok: true };
}

/**
 * Deletes the object from R2 first and then its record, so a storage failure
 * leaves both in place. If the primary image is removed, the next image in
 * order takes its place.
 */
export async function deleteProductImage(
  profile: AdminProfile,
  productId: string,
  imageId: string,
): Promise<ImageMutationResult> {
  const editable = await getEditableImage(profile, productId, imageId);

  if (!editable) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const { product, image } = editable;

  try {
    await getMediaStorage().delete(image.objectKey);
  } catch (error) {
    if (error instanceof MediaStorageError) {
      return { ok: false, reason: "STORAGE_ERROR" };
    }
    throw error;
  }

  await withProductLock(product.id, (executor) => [
    executor
      .delete(productImages)
      .where(
        and(
          eq(productImages.id, image.id),
          eq(productImages.productId, product.id),
        ),
      ),
    executor
      .update(productImages)
      .set({ isPrimary: true, updatedAt: sql`now()` })
      .where(
        and(
          eq(
            productImages.id,
            sql`(
              select ${productImages.id} from ${productImages}
              where ${productImages.productId} = ${product.id}
              order by ${productImages.displayOrder}, ${productImages.createdAt}, ${productImages.id}
              limit 1
            )`,
          ),
          sql`not exists (
            select 1 from ${productImages}
            where ${productImages.productId} = ${product.id}
              and ${productImages.isPrimary}
          )`,
        ),
      ),
  ]);
  await recordProductChange(profile, product.id);

  return { ok: true };
}

export async function moveProductImage(
  profile: AdminProfile,
  productId: string,
  imageId: string,
  direction: "up" | "down",
): Promise<ImageMutationResult> {
  const product = await getEditableProduct(profile, productId);

  if (!product) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const ids = moveInOrder(
    (await getProductImages(product.id)).map(({ id }) => id),
    imageId,
    direction,
  );

  if (!ids) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  await db
    .update(productImages)
    .set({ displayOrder: displayOrderByPosition(productImages.id, ids) })
    .where(
      and(
        eq(productImages.productId, product.id),
        inArray(productImages.id, ids),
      ),
    );
  await recordProductChange(profile, product.id);

  return { ok: true };
}
