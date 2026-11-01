import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { associationsTable as associations } from "@/db/schema/associations";
import type {
  AssociationProfileFieldErrors,
  AssociationProfileInput,
} from "@/lib/admin/association-profile-form";
import {
  ASSOCIATION_NAME_INDEX,
  DUPLICATE_ASSOCIATION_NAME,
  isAssociationNameTaken,
} from "@/lib/admin/associations";
import { isUniqueViolation } from "@/lib/admin/unique-slug";
import { canManageAssociation, isSuperAdmin } from "@/lib/auth/authorization";
import type { AdminProfile } from "@/lib/auth/get-current-profile";
import {
  associationImageKey,
  type AssociationImageKind,
} from "@/lib/storage/association-images";
import {
  detectImageFormat,
  MAX_IMAGE_BYTES,
} from "@/lib/storage/product-images";
import { getMediaStorage, MediaStorageError } from "@/lib/storage/r2";

export type AssociationProfileResult =
  | { ok: true }
  | {
      ok: false;
      reason: "INVALID";
      fieldErrors: AssociationProfileFieldErrors;
    }
  | { ok: false; reason: "INVALID_FILE"; message: string }
  | { ok: false; reason: "NOT_FOUND" | "STORAGE_ERROR" | "CONFLICT" };

function isUuid(value: string) {
  return z.uuid().safeParse(value).success;
}

/**
 * An association's profile if the profile may manage it: any association
 * for a super administrator, their own for an association administrator.
 */
export async function getAssociationProfile(
  profile: AdminProfile,
  associationId: string,
) {
  if (!isUuid(associationId) || !canManageAssociation(profile, associationId)) {
    return null;
  }

  const [association] = await db
    .select({
      id: associations.id,
      name: associations.name,
      slug: associations.slug,
      status: associations.status,
      location: associations.location,
      description: associations.description,
      history: associations.history,
      contactName: associations.contactName,
      whatsappNumber: associations.whatsappNumber,
      logoObjectKey: associations.logoObjectKey,
      coverObjectKey: associations.coverObjectKey,
    })
    .from(associations)
    .where(eq(associations.id, associationId))
    .limit(1);

  return association ?? null;
}

export type AssociationProfile = NonNullable<
  Awaited<ReturnType<typeof getAssociationProfile>>
>;

/**
 * Saves the public profile. Only a super administrator renames an
 * association; for anyone else the name is left as it is. The slug never
 * changes, so public links keep working.
 */
export async function updateAssociationProfile(
  profile: AdminProfile,
  associationId: string,
  input: AssociationProfileInput,
): Promise<AssociationProfileResult> {
  const current = await getAssociationProfile(profile, associationId);

  if (!current) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  // Anyone else leaves the column untouched: writing back the name read
  // above would undo a rename committed meanwhile.
  const rename = isSuperAdmin(profile) ? { name: input.name } : {};
  const duplicate = {
    ok: false,
    reason: "INVALID",
    fieldErrors: { name: DUPLICATE_ASSOCIATION_NAME },
  } as const;

  if (rename.name && (await isAssociationNameTaken(rename.name, current.id))) {
    return duplicate;
  }

  try {
    await db
      .update(associations)
      .set({
        ...rename,
        location: input.location,
        description: input.description,
        history: input.history,
        contactName: input.contactName,
        whatsappNumber: input.whatsappNumber,
        updatedAt: sql`now()`,
      })
      .where(eq(associations.id, current.id));
  } catch (error) {
    if (isUniqueViolation(error, ASSOCIATION_NAME_INDEX)) {
      return duplicate;
    }
    throw error;
  }

  return { ok: true };
}

const imageColumns = {
  logo: associations.logoObjectKey,
  cover: associations.coverObjectKey,
} as const;

/** Sets the column only if it still holds `expected`, the key read before. */
function keyIs(kind: AssociationImageKind, expected: string | null) {
  return expected === null
    ? isNull(imageColumns[kind])
    : eq(imageColumns[kind], expected);
}

/**
 * Uploads a new logo or cover and records its key. Order avoids orphans:
 * the object goes to R2 first and is deleted if recording it fails or the
 * image changed meanwhile; the replaced object is deleted last, and a
 * failure there only leaves an unused file, never a broken profile.
 */
export async function setAssociationImage(
  profile: AdminProfile,
  associationId: string,
  kind: AssociationImageKind,
  bytes: Uint8Array<ArrayBuffer>,
): Promise<AssociationProfileResult> {
  const current = await getAssociationProfile(profile, associationId);

  if (!current) {
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

  const previousKey =
    kind === "logo" ? current.logoObjectKey : current.coverObjectKey;
  const storage = getMediaStorage();
  const objectKey = associationImageKey(current.id, kind, format.extension);

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
      .update(associations)
      .set({
        [kind === "logo" ? "logoObjectKey" : "coverObjectKey"]: objectKey,
        updatedAt: sql`now()`,
      })
      .where(and(eq(associations.id, current.id), keyIs(kind, previousKey)))
      .returning({ id: associations.id });
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
 * Removes a logo or cover: the object is deleted from R2 first, so a storage
 * failure leaves the profile as it was, and then its key is cleared.
 */
export async function removeAssociationImage(
  profile: AdminProfile,
  associationId: string,
  kind: AssociationImageKind,
): Promise<AssociationProfileResult> {
  const current = await getAssociationProfile(profile, associationId);

  if (!current) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const objectKey =
    kind === "logo" ? current.logoObjectKey : current.coverObjectKey;

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
    .update(associations)
    .set({
      [kind === "logo" ? "logoObjectKey" : "coverObjectKey"]: null,
      updatedAt: sql`now()`,
    })
    .where(and(eq(associations.id, current.id), keyIs(kind, objectKey)));

  return { ok: true };
}
