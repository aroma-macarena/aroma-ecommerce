import { and, asc, eq, like, ne, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { associationsTable as associations } from "@/db/schema/associations";
import { withUniqueSlug } from "@/lib/admin/unique-slug";
import { isSuperAdmin } from "@/lib/auth/authorization";
import type { AdminProfile } from "@/lib/auth/get-current-profile";
import { nextAvailableSlug, slugCandidatePrefix, slugify } from "@/lib/slug";

export type AssociationStatus = "ACTIVE" | "INACTIVE";

/** Fields a super administrator fills in to create an association. */
export const associationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escribe el nombre de la asociación.")
    .max(200, "El nombre puede tener hasta 200 caracteres."),
  location: z
    .string()
    .trim()
    .max(255, "La ubicación puede tener hasta 255 caracteres.")
    .transform((value) => value || null),
});

export type AssociationFormInput = z.infer<typeof associationFormSchema>;
export type AssociationFieldErrors = Partial<
  Record<keyof AssociationFormInput, string>
>;

export function parseAssociationForm(values: {
  name?: string;
  location?: string;
}) {
  const result = associationFormSchema.safeParse({
    name: values.name ?? "",
    location: values.location ?? "",
  });

  if (result.success) {
    return { success: true as const, data: result.data };
  }

  const fieldErrors: AssociationFieldErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof AssociationFormInput;
    fieldErrors[field] ??= issue.message;
  }

  return { success: false as const, fieldErrors };
}

export type AssociationFormState = {
  status: "idle" | "error";
  /** Increases on every failed submission so the form can restore values. */
  attempt: number;
  message?: string;
  fieldErrors?: AssociationFieldErrors;
  values?: { name: string; location: string };
};

export type AssociationMutationResult =
  | { ok: true; slug: string }
  | { ok: false; reason: "INVALID"; fieldErrors: AssociationFieldErrors }
  | { ok: false; reason: "FORBIDDEN" | "NOT_FOUND" };

/**
 * Every association with what an alliance administrator needs to decide on
 * it: public and total products and admin accounts. Null for anyone but a
 * super administrator.
 */
export async function getAdminAssociations(profile: AdminProfile) {
  if (!isSuperAdmin(profile)) {
    return null;
  }

  // Explicit aliases: in a single-table select Drizzle leaves columns
  // unqualified, which would be ambiguous inside these subqueries.
  return db
    .select({
      id: associations.id,
      name: associations.name,
      slug: associations.slug,
      location: associations.location,
      status: associations.status,
      productCount: sql<number>`(
        select count(*)::int from products as p
        where p.association_id = "associations"."id"
      )`,
      publishedCount: sql<number>`(
        select count(*)::int from products as p
        where p.association_id = "associations"."id"
          and p.status = 'PUBLISHED'
      )`,
      adminCount: sql<number>`(
        select count(*)::int from profiles as a
        where a.association_id = "associations"."id"
      )`,
    })
    .from(associations)
    .orderBy(asc(associations.name));
}

export type AdminAssociation = NonNullable<
  Awaited<ReturnType<typeof getAdminAssociations>>
>[number];

async function findAvailableAssociationSlug(name: string) {
  const base = slugify(name);
  const rows = await db
    .select({ slug: associations.slug })
    .from(associations)
    .where(
      like(associations.slug, `${slugCandidatePrefix(base, "asociacion")}%`),
    );

  return nextAvailableSlug(
    base,
    rows.map(({ slug }) => slug),
    "asociacion",
  );
}

const duplicateNameError = {
  ok: false,
  reason: "INVALID",
  fieldErrors: { name: "Ya existe una asociación con ese nombre." },
} as const satisfies AssociationMutationResult;

/** Whether another association already uses this name, ignoring case. */
async function isNameTaken(name: string, exceptId?: string) {
  const [duplicate] = await db
    .select({ id: associations.id })
    .from(associations)
    .where(
      and(
        sql`lower(${associations.name}) = lower(${name})`,
        exceptId ? ne(associations.id, exceptId) : undefined,
      ),
    )
    .limit(1);

  return Boolean(duplicate);
}

function isUuid(value: string) {
  return z.uuid().safeParse(value).success;
}

/** An association's editable fields, for super administrators only. */
export async function getEditableAssociation(
  profile: AdminProfile,
  associationId: string,
) {
  if (!isSuperAdmin(profile) || !isUuid(associationId)) {
    return null;
  }

  const [association] = await db
    .select({
      id: associations.id,
      name: associations.name,
      slug: associations.slug,
      location: associations.location,
      status: associations.status,
    })
    .from(associations)
    .where(eq(associations.id, associationId))
    .limit(1);

  return association ?? null;
}

/**
 * Creates an active association. Its slug comes from the name, gets a suffix
 * when taken and never changes afterwards, because it is the public address.
 */
export async function createAssociation(
  profile: AdminProfile,
  input: AssociationFormInput,
): Promise<AssociationMutationResult> {
  if (!isSuperAdmin(profile)) {
    return { ok: false, reason: "FORBIDDEN" };
  }

  if (await isNameTaken(input.name)) {
    return duplicateNameError;
  }

  const [created] = await withUniqueSlug(async () =>
    db
      .insert(associations)
      .values({
        name: input.name,
        location: input.location,
        slug: await findAvailableAssociationSlug(input.name),
      })
      .returning({ slug: associations.slug }),
  );

  return { ok: true, slug: created.slug };
}

/**
 * Renames an association or changes its location. The slug stays as it is,
 * so links to its public profile and product pages keep working.
 */
export async function updateAssociation(
  profile: AdminProfile,
  associationId: string,
  input: AssociationFormInput,
): Promise<AssociationMutationResult> {
  if (!isSuperAdmin(profile)) {
    return { ok: false, reason: "FORBIDDEN" };
  }

  if (!isUuid(associationId)) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  if (await isNameTaken(input.name, associationId)) {
    return duplicateNameError;
  }

  const [updated] = await db
    .update(associations)
    .set({
      name: input.name,
      location: input.location,
      updatedAt: sql`now()`,
    })
    .where(eq(associations.id, associationId))
    .returning({ slug: associations.slug });

  return updated
    ? { ok: true, slug: updated.slug }
    : { ok: false, reason: "NOT_FOUND" };
}

/**
 * Turns an association's participation on or off. Nothing is deleted: the
 * status alone hides it and its products from the storefront and blocks its
 * administrators, through the existing visibility and access rules.
 */
export async function setAssociationStatus(
  profile: AdminProfile,
  associationId: string,
  status: AssociationStatus,
): Promise<AssociationMutationResult> {
  if (!isSuperAdmin(profile)) {
    return { ok: false, reason: "FORBIDDEN" };
  }

  if (!isUuid(associationId)) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const [updated] = await db
    .update(associations)
    .set({ status, updatedAt: sql`now()` })
    .where(eq(associations.id, associationId))
    .returning({ slug: associations.slug });

  return updated
    ? { ok: true, slug: updated.slug }
    : { ok: false, reason: "NOT_FOUND" };
}
