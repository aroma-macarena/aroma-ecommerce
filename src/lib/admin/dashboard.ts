import { and, asc, count, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { associationsTable as associations } from "@/db/schema/associations";
import { categoriesTable as categories } from "@/db/schema/categories";
import { productPresentationsTable as productPresentations } from "@/db/schema/productPresentations";
import { productsTable as products } from "@/db/schema/products";
import { profilesTable as profiles } from "@/db/schema/profiles";
import {
  getPublicationRequirements,
  type PublicationRequirement,
} from "@/lib/admin/product-publication";
import { isAssociationAdmin, isSuperAdmin } from "@/lib/auth/authorization";
import type { AdminProfile } from "@/lib/auth/get-current-profile";

/** What blocks a draft, worded as what is missing. */
const missingLabels: Record<PublicationRequirement["id"], string> = {
  name: "Le falta el nombre",
  category: "Su categoría está inactiva",
  association: "La asociación está inactiva",
  presentation: "Le falta una presentación disponible",
};

const availablePresentations = sql<number>`(
  select count(*)::int from ${productPresentations}
  where ${productPresentations.productId} = ${products.id}
    and ${productPresentations.isAvailable}
)`;

/**
 * The association administrator's summary: their products by status, the
 * drafts with what each one still needs to be published, and the
 * association's public state. Null for anyone else.
 */
export async function getAssociationDashboard(profile: AdminProfile) {
  if (!isAssociationAdmin(profile)) {
    return null;
  }

  const ownProducts = eq(products.associationId, profile.associationId);

  const [statusCounts, drafts, [association]] = await Promise.all([
    db
      .select({ status: products.status, total: count() })
      .from(products)
      .where(ownProducts)
      .groupBy(products.status),
    db
      .select({
        id: products.id,
        name: products.name,
        categoryIsActive: categories.isActive,
        associationStatus: associations.status,
        availablePresentations,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(associations, eq(products.associationId, associations.id))
      .where(and(ownProducts, eq(products.status, "DRAFT")))
      .orderBy(
        sql`coalesce(${products.updatedAt}, ${products.createdAt}) desc`,
        asc(products.id),
      ),
    db
      .select({ slug: associations.slug, status: associations.status })
      .from(associations)
      .where(eq(associations.id, profile.associationId))
      .limit(1),
  ]);

  const byStatus = Object.fromEntries(
    statusCounts.map(({ status, total }) => [status, total]),
  );

  return {
    counts: {
      published: byStatus.PUBLISHED ?? 0,
      drafts: byStatus.DRAFT ?? 0,
      paused: byStatus.PAUSED ?? 0,
    },
    drafts: drafts.map((draft) => {
      const missing = getPublicationRequirements({
        name: draft.name,
        categoryIsActive: draft.categoryIsActive,
        associationIsActive: draft.associationStatus === "ACTIVE",
        availablePresentations: draft.availablePresentations,
      })
        .filter(({ met }) => !met)
        .map(({ id }) => missingLabels[id]);

      return { id: draft.id, name: draft.name, missing };
    }),
    association: association ?? null,
  };
}

export type AssociationDashboard = NonNullable<
  Awaited<ReturnType<typeof getAssociationDashboard>>
>;

/**
 * The super administrator's summary of the alliance: associations, what the
 * storefront shows and invitations waiting to be accepted. Null for anyone
 * else.
 */
export async function getAllianceDashboard(profile: AdminProfile) {
  if (!isSuperAdmin(profile)) {
    return null;
  }

  const [[associationCounts], [productCounts], [invitationCounts]] =
    await Promise.all([
      db
        .select({
          total: count(),
          active: sql<number>`count(*) filter (where ${associations.status} = 'ACTIVE')::int`,
        })
        .from(associations),
      db
        .select({ published: count() })
        .from(products)
        .where(eq(products.status, "PUBLISHED")),
      db
        .select({ pending: count() })
        .from(profiles)
        .where(isNotNull(profiles.invitationId)),
    ]);

  return {
    associations: {
      active: associationCounts.active,
      total: associationCounts.total,
    },
    publishedProducts: productCounts.published,
    pendingInvitations: invitationCounts.pending,
  };
}

export type AllianceDashboard = NonNullable<
  Awaited<ReturnType<typeof getAllianceDashboard>>
>;
