import { and, asc, eq, like, ne, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { categoriesTable as categories } from "@/db/schema/categories";
import { isUniqueViolation, withUniqueSlug } from "@/lib/admin/unique-slug";
import { isSuperAdmin } from "@/lib/auth/authorization";
import type { AdminProfile } from "@/lib/auth/get-current-profile";
import { nextAvailableSlug, slugCandidatePrefix, slugify } from "@/lib/slug";

/** Database names of the constraints that keep categories unique. */
const NAME_INDEX = "uq_categories_name_lower";
const SLUG_CONSTRAINT = "categories_slug_unique";

/** Fields a super administrator fills in for a category. */
export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escribe el nombre de la categoría.")
    .max(100, "El nombre puede tener hasta 100 caracteres."),
  description: z
    .string()
    .trim()
    .max(500, "La descripción puede tener hasta 500 caracteres.")
    .transform((value) => value || null),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;
export type CategoryFieldErrors = Partial<
  Record<keyof CategoryFormInput, string>
>;

export type CategoryFormState = {
  status: "idle" | "error";
  /** Increases on every failed submission so the form can restore values. */
  attempt: number;
  message?: string;
  fieldErrors?: CategoryFieldErrors;
  values?: { name: string; description: string };
};

export function parseCategoryForm(values: {
  name?: string;
  description?: string;
}) {
  const result = categoryFormSchema.safeParse({
    name: values.name ?? "",
    description: values.description ?? "",
  });

  if (result.success) {
    return { success: true as const, data: result.data };
  }

  const fieldErrors: CategoryFieldErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof CategoryFormInput;
    fieldErrors[field] ??= issue.message;
  }

  return { success: false as const, fieldErrors };
}

export type CategoryMutationResult =
  | { ok: true }
  | { ok: false; reason: "INVALID"; fieldErrors: CategoryFieldErrors }
  | { ok: false; reason: "FORBIDDEN" | "NOT_FOUND" | "IN_USE" };

const duplicateNameError = {
  ok: false,
  reason: "INVALID",
  fieldErrors: { name: "Ya existe una categoría con ese nombre." },
} as const satisfies CategoryMutationResult;

function isUuid(value: string) {
  return z.uuid().safeParse(value).success;
}

// Explicit aliases: in a single-table select Drizzle leaves columns
// unqualified, which would be ambiguous inside these subqueries.
const productCount = sql<number>`(
  select count(*)::int from products as p
  where p.category_id = "categories"."id"
)`;

/**
 * Every category with how many products use it, published and in total.
 * Null for anyone but a super administrator.
 */
export async function getAdminCategories(profile: AdminProfile) {
  if (!isSuperAdmin(profile)) {
    return null;
  }

  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      isActive: categories.isActive,
      productCount,
      publishedCount: sql<number>`(
        select count(*)::int from products as p
        where p.category_id = "categories"."id"
          and p.status = 'PUBLISHED'
      )`,
    })
    .from(categories)
    .orderBy(asc(categories.name));
}

export type AdminCategory = NonNullable<
  Awaited<ReturnType<typeof getAdminCategories>>
>[number];

/** A category's editable fields and usage, for super administrators only. */
export async function getEditableCategory(
  profile: AdminProfile,
  categoryId: string,
) {
  if (!isSuperAdmin(profile) || !isUuid(categoryId)) {
    return null;
  }

  const [category] = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      isActive: categories.isActive,
      productCount,
    })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  return category ?? null;
}

/** Whether another category already uses this name, ignoring case. */
async function isNameTaken(name: string, exceptId?: string) {
  const [duplicate] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        sql`lower(${categories.name}) = lower(${name})`,
        exceptId ? ne(categories.id, exceptId) : undefined,
      ),
    )
    .limit(1);

  return Boolean(duplicate);
}

async function findAvailableCategorySlug(name: string) {
  const base = slugify(name);
  const rows = await db
    .select({ slug: categories.slug })
    .from(categories)
    .where(like(categories.slug, `${slugCandidatePrefix(base, "categoria")}%`));

  return nextAvailableSlug(
    base,
    rows.map(({ slug }) => slug),
    "categoria",
  );
}

/**
 * Creates an active category. Its slug comes from the name, gets a suffix
 * when taken and never changes afterwards: storefront filter links use it.
 */
export async function createCategory(
  profile: AdminProfile,
  input: CategoryFormInput,
): Promise<CategoryMutationResult> {
  if (!isSuperAdmin(profile)) {
    return { ok: false, reason: "FORBIDDEN" };
  }

  if (await isNameTaken(input.name)) {
    return duplicateNameError;
  }

  try {
    // The index also covers two requests using the same name at once,
    // which the check above cannot see.
    await withUniqueSlug(
      async () =>
        db.insert(categories).values({
          name: input.name,
          description: input.description,
          slug: await findAvailableCategorySlug(input.name),
        }),
      SLUG_CONSTRAINT,
    );
  } catch (error) {
    if (isUniqueViolation(error, NAME_INDEX)) {
      return duplicateNameError;
    }
    throw error;
  }

  return { ok: true };
}

/**
 * Renames a category or changes its description. Products keep pointing to
 * it by id, and the slug stays as it is so filter links keep working.
 */
export async function updateCategory(
  profile: AdminProfile,
  categoryId: string,
  input: CategoryFormInput,
): Promise<CategoryMutationResult> {
  if (!isSuperAdmin(profile)) {
    return { ok: false, reason: "FORBIDDEN" };
  }

  if (!isUuid(categoryId)) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  if (await isNameTaken(input.name, categoryId)) {
    return duplicateNameError;
  }

  let updated: { id: string }[];

  try {
    updated = await db
      .update(categories)
      .set({
        name: input.name,
        description: input.description,
        updatedAt: sql`now()`,
      })
      .where(eq(categories.id, categoryId))
      .returning({ id: categories.id });
  } catch (error) {
    if (isUniqueViolation(error, NAME_INDEX)) {
      return duplicateNameError;
    }
    throw error;
  }

  return updated.length > 0 ? { ok: true } : { ok: false, reason: "NOT_FOUND" };
}

/**
 * Turns a category on or off. Nothing is deleted: while inactive, the
 * existing rules hide its products from the storefront, keep it out of new
 * products and let current products keep it.
 */
export async function setCategoryActive(
  profile: AdminProfile,
  categoryId: string,
  isActive: boolean,
): Promise<CategoryMutationResult> {
  if (!isSuperAdmin(profile)) {
    return { ok: false, reason: "FORBIDDEN" };
  }

  if (!isUuid(categoryId)) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const updated = await db
    .update(categories)
    .set({ isActive, updatedAt: sql`now()` })
    .where(eq(categories.id, categoryId))
    .returning({ id: categories.id });

  return updated.length > 0 ? { ok: true } : { ok: false, reason: "NOT_FOUND" };
}

/**
 * Deletes a category no product uses, such as one created by mistake. The
 * check is part of the delete, and the products foreign key backs it up.
 */
export async function deleteUnusedCategory(
  profile: AdminProfile,
  categoryId: string,
): Promise<CategoryMutationResult> {
  if (!isSuperAdmin(profile)) {
    return { ok: false, reason: "FORBIDDEN" };
  }

  const category = await getEditableCategory(profile, categoryId);

  if (!category) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const deleted = await db
    .delete(categories)
    .where(
      and(
        eq(categories.id, categoryId),
        sql`not exists (
          select 1 from products as p where p.category_id = ${categoryId}::uuid
        )`,
      ),
    )
    .returning({ id: categories.id });

  return deleted.length > 0 ? { ok: true } : { ok: false, reason: "IN_USE" };
}
