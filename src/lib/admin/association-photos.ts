import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { associationPhotosTable as photos } from "@/db/schema/associationPhotos";
import { associationsTable as associations } from "@/db/schema/associations";
import { getAssociationProfile } from "@/lib/admin/association-profile";
import { displayOrderByPosition, moveInOrder } from "@/lib/admin/display-order";
import {
  MAX_ALT_TEXT_LENGTH,
  MAX_CAPTION_LENGTH,
} from "@/lib/admin/image-form";
import { withRowLock } from "@/lib/admin/product-lock";
import type { AdminProfile } from "@/lib/auth/get-current-profile";
import {
  associationPhotoKey,
  MAX_ASSOCIATION_PHOTOS,
} from "@/lib/storage/association-images";
import {
  detectImageFormat,
  MAX_IMAGE_BYTES,
} from "@/lib/storage/product-images";
import { getMediaStorage, MediaStorageError } from "@/lib/storage/r2";

export type PhotoFieldErrors = Partial<
  Record<"file" | "altText" | "caption", string>
>;

export type PhotoMutationResult =
  | { ok: true }
  | { ok: false; reason: "INVALID"; fieldErrors: PhotoFieldErrors }
  | { ok: false; reason: "NOT_FOUND" | "LIMIT_REACHED" | "STORAGE_ERROR" };

const photoOrder = [
  asc(photos.displayOrder),
  asc(photos.createdAt),
  asc(photos.id),
];

/** An association's profile photos, in display order. */
export async function getAssociationPhotos(associationId: string) {
  return db
    .select({
      id: photos.id,
      objectKey: photos.objectKey,
      altText: photos.altText,
      caption: photos.caption,
    })
    .from(photos)
    .where(eq(photos.associationId, associationId))
    .orderBy(...photoOrder);
}

export type AssociationPhoto = Awaited<
  ReturnType<typeof getAssociationPhotos>
>[number];

/** Trims a text and turns it into null when empty; errors past `max`. */
function optionalText(value: string, max: number, label: string) {
  const trimmed = value.trim();

  if (trimmed.length > max) {
    return { error: `${label} puede tener hasta ${max} caracteres.` };
  }

  return { value: trimmed || null };
}

function parseTexts(texts: {
  altText: string;
  caption: string;
}):
  | { fieldErrors: PhotoFieldErrors }
  | { altText: string | null; caption: string | null } {
  const altText = optionalText(
    texts.altText,
    MAX_ALT_TEXT_LENGTH,
    "El texto alternativo",
  );
  const caption = optionalText(texts.caption, MAX_CAPTION_LENGTH, "El pie");
  const fieldErrors: PhotoFieldErrors = {};

  if ("error" in altText) fieldErrors.altText = altText.error;
  if ("error" in caption) fieldErrors.caption = caption.error;

  return "error" in altText || "error" in caption
    ? { fieldErrors }
    : { altText: altText.value, caption: caption.value };
}

/**
 * Stores the photo in R2 and records it last in the order. The object is
 * uploaded first; if recording fails or the association already has its
 * maximum (checked in the same statement, so two uploads cannot both take
 * the last place), the object is deleted again.
 */
export async function uploadAssociationPhoto(
  profile: AdminProfile,
  associationId: string,
  upload: { bytes: Uint8Array<ArrayBuffer>; altText: string; caption: string },
): Promise<PhotoMutationResult> {
  const association = await getAssociationProfile(profile, associationId);

  if (!association) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const format = detectImageFormat(upload.bytes);
  const texts = parseTexts(upload);
  const fieldErrors: PhotoFieldErrors =
    "fieldErrors" in texts ? { ...texts.fieldErrors } : {};

  if (upload.bytes.length === 0) {
    fieldErrors.file = "Elige una foto.";
  } else if (!format) {
    fieldErrors.file = "La foto debe ser JPG, PNG o WebP.";
  } else if (upload.bytes.length > MAX_IMAGE_BYTES) {
    fieldErrors.file = "La foto pesa más de 4 MB incluso después de reducirla.";
  }

  if (!format || "fieldErrors" in texts || Object.keys(fieldErrors).length) {
    return { ok: false, reason: "INVALID", fieldErrors };
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(photos)
    .where(eq(photos.associationId, association.id));

  if (count >= MAX_ASSOCIATION_PHOTOS) {
    return { ok: false, reason: "LIMIT_REACHED" };
  }

  const storage = getMediaStorage();
  const objectKey = associationPhotoKey(association.id, format.extension);

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
    // Counted and inserted under a lock on the association's row, so two
    // uploads at once cannot both see seven photos and make nine.
    [inserted] = await withRowLock<[{ id: string }[]]>(
      (executor) =>
        executor
          .select({ id: associations.id })
          .from(associations)
          .where(eq(associations.id, association.id))
          .for("update"),
      (executor) => [
        executor
          .insert(photos)
          .select(
            executor
              // Insert from select needs every column, in table order.
              .select({
                id: sql<string>`gen_random_uuid()`.as("id"),
                associationId: associations.id,
                objectKey: sql<string>`${objectKey}`.as("object_key"),
                altText: sql<string | null>`${texts.altText}`.as("alt_text"),
                caption: sql<string | null>`${texts.caption}`.as("caption"),
                displayOrder: sql<number>`(
                  select coalesce(max(${photos.displayOrder}) + 1, 0)
                  from ${photos}
                  where ${photos.associationId} = ${association.id}::uuid
                )`.as("display_order"),
                createdAt: sql<Date>`now()`.as("created_at"),
                updatedAt: sql<Date | null>`null`.as("updated_at"),
              })
              .from(associations)
              .where(
                and(
                  eq(associations.id, association.id),
                  sql`(
                    select count(*) from ${photos}
                    where ${photos.associationId} = ${association.id}::uuid
                  ) < ${MAX_ASSOCIATION_PHOTOS}`,
                ),
              ),
          )
          .returning({ id: photos.id }),
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

  return { ok: true };
}

/** A photo of an association the profile may manage; otherwise null. */
async function getEditablePhoto(
  profile: AdminProfile,
  associationId: string,
  photoId: string,
) {
  const association = await getAssociationProfile(profile, associationId);

  if (!association) {
    return null;
  }

  const photo = (await getAssociationPhotos(association.id)).find(
    ({ id }) => id === photoId,
  );

  return photo ? { association, photo } : null;
}

export async function updateAssociationPhoto(
  profile: AdminProfile,
  associationId: string,
  photoId: string,
  texts: { altText: string; caption: string },
): Promise<PhotoMutationResult> {
  const editable = await getEditablePhoto(profile, associationId, photoId);

  if (!editable) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const parsed = parseTexts(texts);

  if ("fieldErrors" in parsed) {
    return { ok: false, reason: "INVALID", fieldErrors: parsed.fieldErrors };
  }

  await db
    .update(photos)
    .set({
      altText: parsed.altText,
      caption: parsed.caption,
      updatedAt: sql`now()`,
    })
    .where(eq(photos.id, editable.photo.id));

  return { ok: true };
}

export async function moveAssociationPhoto(
  profile: AdminProfile,
  associationId: string,
  photoId: string,
  direction: "up" | "down",
): Promise<PhotoMutationResult> {
  const association = await getAssociationProfile(profile, associationId);

  if (!association) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const ids = moveInOrder(
    (await getAssociationPhotos(association.id)).map(({ id }) => id),
    photoId,
    direction,
  );

  if (!ids) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  // One statement renumbers every photo, so the order never has repeats.
  await db
    .update(photos)
    .set({ displayOrder: displayOrderByPosition(photos.id, ids) })
    .where(eq(photos.associationId, association.id));

  return { ok: true };
}

/**
 * Deletes the object from R2 first and then its record, so a storage
 * failure leaves both in place.
 */
export async function deleteAssociationPhoto(
  profile: AdminProfile,
  associationId: string,
  photoId: string,
): Promise<PhotoMutationResult> {
  const editable = await getEditablePhoto(profile, associationId, photoId);

  if (!editable) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  try {
    await getMediaStorage().delete(editable.photo.objectKey);
  } catch (error) {
    if (error instanceof MediaStorageError) {
      return { ok: false, reason: "STORAGE_ERROR" };
    }
    throw error;
  }

  await db
    .delete(photos)
    .where(
      and(
        eq(photos.id, editable.photo.id),
        eq(photos.associationId, editable.association.id),
      ),
    );

  return { ok: true };
}
