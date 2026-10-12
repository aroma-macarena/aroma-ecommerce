import { and, asc, eq, or, type SQL, sql } from "drizzle-orm";

import { db } from "@/db";
import { associationsTable as associations } from "@/db/schema/associations";
import { categoriesTable as categories } from "@/db/schema/categories";
import { productsTable as products } from "@/db/schema/products";
import { canManageAssociation, isSuperAdmin } from "@/lib/auth/authorization";
import type { AdminProfile } from "@/lib/auth/get-current-profile";

/**
 * Products an administrator may see in the admin area:
 * - SUPER_ADMIN: every product, in every state and association.
 * - ASSOCIATION_ADMIN: every product of their association, plus published
 *   products of other active associations as read-only references.
 */
function getVisibilityFilter(profile: AdminProfile): SQL | undefined {
  if (isSuperAdmin(profile)) {
    return undefined;
  }

  return or(
    eq(products.associationId, profile.associationId),
    and(eq(products.status, "PUBLISHED"), eq(associations.status, "ACTIVE")),
  );
}

export async function getAdminProducts(profile: AdminProfile) {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      status: products.status,
      updatedAt: sql<string>`coalesce(${products.updatedAt}, ${products.createdAt})`,
      categoryName: categories.name,
      categoryIsActive: categories.isActive,
      associationId: associations.id,
      associationName: associations.name,
      associationStatus: associations.status,
    })
    .from(products)
    .innerJoin(associations, eq(products.associationId, associations.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(getVisibilityFilter(profile))
    .orderBy(
      asc(associations.name),
      sql`coalesce(${products.updatedAt}, ${products.createdAt}) desc`,
    );

  return rows.map((row) => ({
    ...row,
    canManage: canManageAssociation(profile, row.associationId),
  }));
}

export type AdminProduct = Awaited<ReturnType<typeof getAdminProducts>>[number];
