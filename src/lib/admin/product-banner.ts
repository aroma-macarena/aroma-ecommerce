import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { productsTable as products } from "@/db/schema/products";
import { getEditableProduct } from "@/lib/admin/product-mutations";
import type { AdminProfile } from "@/lib/auth/get-current-profile";
import {
  detectImageFormat,
  MAX_IMAGE_BYTES,
  productBannerKey,
} from "@/lib/storage/product-images";
import { getMediaStorage, MediaStorageError } from "@/lib/storage/r2";

export type ProductBannerResult =
  | { ok: true }
  | { ok: false; reason: "INVALID_FILE"; message: string }
  | { ok: false; reason: "NOT_FOUND" | "STORAGE_ERROR" | "CONFLICT" };

/** Sets the column only if it still holds `expected`, the key read before. */
function bannerIs(expected: string | null) {
  return expected === null
    ? isNull(products.bannerObjectKey)
    : eq(products.bannerObjectKey, expected);
}

/**
 * Uploads a product's home banner and records its key. Order avoids
 * orphans: the object goes to R2 first and is deleted if recording it fails
 * or the banner changed meanwhile; the replaced object is deleted last, and
 * a failure there only leaves an unused file, never a broken product.
 */
export async function setProductBanner(
  profile: AdminProfile,
  productId: string,
  bytes: Uint8Array<ArrayBuffer>,
): Promise<ProductBannerResult> {
  const product = await getEditableProduct(profile, productId);

  if (!product) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const format = detectImageFormat(bytes);

  if (bytes.length === 0 || !format) {
    return {
      ok: false,
      reason: "INVALID_FILE",
      message: "La imagen debe ser JPG, PNG o WebP.",
    };
  }

  if (bytes.length > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      reason: "INVALID_FILE",
      message: "La imagen pesa más de 4 MB incluso después de reducirla.",
    };
  }

  const previousKey = product.bannerObjectKey;
  const storage = getMediaStorage();
  const objectKey = productBannerKey(product.id, format.extension);

  try {
    await storage.put(objectKey, bytes, format.type);
  } catch (error) {
    if (error instanceof MediaStorageError) {
      return { ok: false, reason: "STORAGE_ERROR" };
    }
    throw error;
  }

  let updated: { id: string }[];

  try {
    updated = await db
      .update(products)
      .set({
        bannerObjectKey: objectKey,
        updatedBy: profile.id,
        updatedAt: sql`now()`,
      })
      .where(and(eq(products.id, product.id), bannerIs(previousKey)))
      .returning({ id: products.id });
  } catch (error) {
    await storage.delete(objectKey).catch(() => undefined);
    throw error;
  }

  if (updated.length === 0) {
    await storage.delete(objectKey).catch(() => undefined);
    return { ok: false, reason: "CONFLICT" };
  }

  if (previousKey) {
    await storage.delete(previousKey).catch(() => undefined);
  }

  return { ok: true };
}

/**
 * Removes a product's home banner: the object is deleted from R2 first, so a
 * storage failure leaves the product as it was, and then its key is cleared.
 */
export async function removeProductBanner(
  profile: AdminProfile,
  productId: string,
): Promise<ProductBannerResult> {
  const product = await getEditableProduct(profile, productId);

  if (!product) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const objectKey = product.bannerObjectKey;

  if (!objectKey) {
    return { ok: true };
  }

  try {
    await getMediaStorage().delete(objectKey);
  } catch (error) {
    if (error instanceof MediaStorageError) {
      return { ok: false, reason: "STORAGE_ERROR" };
    }
    throw error;
  }

  await db
    .update(products)
    .set({
      bannerObjectKey: null,
      updatedBy: profile.id,
      updatedAt: sql`now()`,
    })
    .where(and(eq(products.id, product.id), bannerIs(objectKey)));

  return { ok: true };
}
