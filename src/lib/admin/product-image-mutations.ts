import { and, asc, count, desc, eq, inArray, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { productImagesTable as productImages } from "@/db/schema/productImages";
import { productsTable as products } from "@/db/schema/products";
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

// The primary image always comes first. Sorting by it too keeps that true
// for images saved before this rule existed.
const imageOrder = [
  desc(productImages.isPrimary),
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

  let inserted: { id: string }[];

  try {
    // Under the product lock, two first uploads cannot both become primary
    // and two uploads cannot both take the last free place.
    [inserted] = await withProductLock<[{ id: string }[]]>(
      product.id,
      (executor) => [
        executor
          .insert(productImages)
          .select(
            executor
              // Insert from select needs every column, in table order.
              .select({
                id: sql<string>`gen_random_uuid()`.as("id"),
                productId: products.id,
                objectKey: sql<string>`${objectKey}`.as("object_key"),
                altText: sql<string | null>`${altText.value}`.as("alt_text"),
                displayOrder: sql<number>`(
                  select coalesce(max(${productImages.displayOrder}) + 1, 0)
                  from ${productImages}
                  where ${productImages.productId} = ${product.id}::uuid
                )`.as("display_order"),
                isPrimary: sql<boolean>`not exists (
                  select 1 from ${productImages}
                  where ${productImages.productId} = ${product.id}::uuid
                    and ${productImages.isPrimary}
                )`.as("is_primary"),
                createdAt: sql<Date>`now()`.as("created_at"),
                updatedAt: sql<Date | null>`null`.as("updated_at"),
              })
              .from(products)
              .where(
                and(
                  eq(products.id, product.id),
                  sql`(
                    select count(*) from ${productImages}
                    where ${productImages.productId} = ${product.id}::uuid
                  ) < ${MAX_IMAGES_PER_PRODUCT}`,
                ),
              ),
          )
          .returning({ id: productImages.id }),
      ],
    );
  } catch (error) {
    await storage.delete(objectKey).catch(() => undefined);
    throw error;
  }

  if (inserted.length === 0) {
    await storage.delete(objectKey).catch(() => undefined);
    return { ok: false, reason: "LIMIT_REACHED" };
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
 * Saves the images in the given order and makes the first one primary: the
 * primary image is always the first. The previous primary is cleared first,
 * in the same transaction, so the unique index on primary images is never
 * violated, not even for a moment.
 */
async function saveImageOrder(productId: string, ids: string[]) {
  // Checked under the lock: if the new first image was deleted meanwhile,
  // nothing changes, so the product never ends up without a primary image.
  const firstStillExists = sql`exists (
    select 1 from ${productImages} as target
    where target.id = ${ids[0]}::uuid and target.product_id = ${productId}::uuid
  )`;

  const [, updated] = await withProductLock<[unknown, { id: string }[]]>(
    productId,
    (executor) => [
      executor
        .update(productImages)
        .set({ isPrimary: false, updatedAt: sql`now()` })
        .where(
          and(
            eq(productImages.productId, productId),
            eq(productImages.isPrimary, true),
            ne(productImages.id, ids[0]),
            firstStillExists,
          ),
        ),
      executor
        .update(productImages)
        .set({
          displayOrder: displayOrderByPosition(productImages.id, ids),
          isPrimary: sql`${productImages.id} = ${ids[0]}::uuid`,
        })
        .where(
          and(
            eq(productImages.productId, productId),
            inArray(productImages.id, ids),
            firstStillExists,
          ),
        )
        .returning({ id: productImages.id }),
    ],
  );

  return updated.length > 0;
}

/** Makes an image primary by moving it to the first place. */
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
  const ids = (await getProductImages(product.id)).map(({ id }) => id);

  const saved = await saveImageOrder(product.id, [
    image.id,
    ...ids.filter((id) => id !== image.id),
  ]);

  if (!saved) {
    return { ok: false, reason: "NOT_FOUND" };
  }

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

  // Moving an image to the first place makes it the primary one.
  await saveImageOrder(product.id, ids);
  await recordProductChange(profile, product.id);

  return { ok: true };
}
