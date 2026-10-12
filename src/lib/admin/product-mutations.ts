import { and, asc, eq, like, ne, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { associationsTable as associations } from "@/db/schema/associations";
import { categoriesTable as categories } from "@/db/schema/categories";
import { productsTable as products } from "@/db/schema/products";
import type {
  ProductFieldErrors,
  ProductFormInput,
} from "@/lib/admin/product-form";
import { canManageAssociation, isSuperAdmin } from "@/lib/auth/authorization";
import type { AdminProfile } from "@/lib/auth/get-current-profile";
import { nextAvailableSlug, slugCandidatePrefix, slugify } from "@/lib/slug";

export type ProductMutationResult =
  | { ok: true; productId: string }
  | { ok: false; reason: "INVALID"; fieldErrors: ProductFieldErrors }
  | { ok: false; reason: "NOT_FOUND" };

const MAX_SLUG_ATTEMPTS = 3;

function isUuid(value: string | undefined): value is string {
  return z.uuid().safeParse(value).success;
}

function isUniqueViolation(error: unknown) {
  const code = (error as { code?: string; cause?: { code?: string } })?.code;
  const causeCode = (error as { cause?: { code?: string } })?.cause?.code;
  return code === "23505" || causeCode === "23505";
}

async function findAvailableSlug(
  associationId: string,
  name: string,
  excludeProductId?: string,
) {
  const base = slugify(name);
  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .where(
      and(
        eq(products.associationId, associationId),
        like(products.slug, `${slugCandidatePrefix(base)}%`),
        excludeProductId ? ne(products.id, excludeProductId) : undefined,
      ),
    );

  return nextAvailableSlug(
    base,
    rows.map(({ slug }) => slug),
  );
}

/** Retries when another save takes the same slug at the same time. */
async function withUniqueSlug<T>(save: () => Promise<T>) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await save();
    } catch (error) {
      if (!isUniqueViolation(error) || attempt >= MAX_SLUG_ATTEMPTS) {
        throw error;
      }
    }
  }
}

async function isSelectableCategory(
  categoryId: string,
  currentCategoryId?: string,
) {
  if (!isUuid(categoryId)) {
    return false;
  }

  if (categoryId === currentCategoryId) {
    return true;
  }

  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.isActive, true)))
    .limit(1);

  return Boolean(category);
}

async function isActiveAssociation(associationId: string) {
  if (!isUuid(associationId)) {
    return false;
  }

  const [association] = await db
    .select({ id: associations.id })
    .from(associations)
    .where(
      and(
        eq(associations.id, associationId),
        eq(associations.status, "ACTIVE"),
      ),
    )
    .limit(1);

  return Boolean(association);
}

/** Categories and associations the profile may choose in the form. */
export async function getProductFormOptions(
  profile: AdminProfile,
  currentCategoryId?: string,
) {
  const [categoryOptions, associationOptions] = await Promise.all([
    db
      .select({
        id: categories.id,
        name: categories.name,
        isActive: categories.isActive,
      })
      .from(categories)
      .where(
        currentCategoryId
          ? or(
              eq(categories.isActive, true),
              eq(categories.id, currentCategoryId),
            )
          : eq(categories.isActive, true),
      )
      .orderBy(asc(categories.name)),
    isSuperAdmin(profile)
      ? db
          .select({ id: associations.id, name: associations.name })
          .from(associations)
          .where(eq(associations.status, "ACTIVE"))
          .orderBy(asc(associations.name))
      : Promise.resolve([]),
  ]);

  return { categoryOptions, associationOptions };
}

/** The product if the profile may manage it; otherwise null. */
export async function getEditableProduct(
  profile: AdminProfile,
  productId: string,
) {
  if (!isUuid(productId)) {
    return null;
  }

  const [product] = await db
    .select({
      id: products.id,
      associationId: products.associationId,
      associationName: associations.name,
      categoryId: products.categoryId,
      name: products.name,
      slug: products.slug,
      status: products.status,
      shortDescription: products.shortDescription,
      description: products.description,
      origin: products.origin,
      ingredients: products.ingredients,
      availabilityNote: products.availabilityNote,
    })
    .from(products)
    .innerJoin(associations, eq(products.associationId, associations.id))
    .where(eq(products.id, productId))
    .limit(1);

  if (!product || !canManageAssociation(profile, product.associationId)) {
    return null;
  }

  return product;
}

export type EditableProduct = NonNullable<
  Awaited<ReturnType<typeof getEditableProduct>>
>;

/** Creates a draft product in an association the profile may manage. */
export async function createProduct(
  profile: AdminProfile,
  input: ProductFormInput,
): Promise<ProductMutationResult> {
  const fieldErrors: ProductFieldErrors = {};
  const associationId = isSuperAdmin(profile)
    ? input.associationId
    : profile.associationId;

  if (
    !associationId ||
    !canManageAssociation(profile, associationId) ||
    !(await isActiveAssociation(associationId))
  ) {
    fieldErrors.associationId = "Elige una asociación activa.";
  }

  if (!(await isSelectableCategory(input.categoryId))) {
    fieldErrors.categoryId = "Elige una categoría activa.";
  }

  if (Object.keys(fieldErrors).length > 0 || !associationId) {
    return { ok: false, reason: "INVALID", fieldErrors };
  }

  const [created] = await withUniqueSlug(async () =>
    db
      .insert(products)
      .values({
        associationId,
        categoryId: input.categoryId,
        name: input.name,
        slug: await findAvailableSlug(associationId, input.name),
        shortDescription: input.shortDescription,
        description: input.description,
        origin: input.origin,
        ingredients: input.ingredients,
        availabilityNote: input.availabilityNote,
        status: "DRAFT",
        createdBy: profile.id,
        updatedBy: profile.id,
      })
      .returning({ id: products.id }),
  );

  return { ok: true, productId: created.id };
}

/**
 * Updates a product the profile may manage. The association never changes,
 * and the slug follows the name only while the product is a draft, so
 * published links keep working.
 */
export async function updateProduct(
  profile: AdminProfile,
  productId: string,
  input: ProductFormInput,
): Promise<ProductMutationResult> {
  const product = await getEditableProduct(profile, productId);

  if (!product) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  if (!(await isSelectableCategory(input.categoryId, product.categoryId))) {
    return {
      ok: false,
      reason: "INVALID",
      fieldErrors: { categoryId: "Elige una categoría activa." },
    };
  }

  const followsName = product.status === "DRAFT" && input.name !== product.name;

  await withUniqueSlug(async () =>
    db
      .update(products)
      .set({
        categoryId: input.categoryId,
        name: input.name,
        slug: followsName
          ? await findAvailableSlug(
              product.associationId,
              input.name,
              product.id,
            )
          : product.slug,
        shortDescription: input.shortDescription,
        description: input.description,
        origin: input.origin,
        ingredients: input.ingredients,
        availabilityNote: input.availabilityNote,
        updatedBy: profile.id,
        updatedAt: sql`now()`,
      })
      .where(eq(products.id, product.id)),
  );

  return { ok: true, productId: product.id };
}
