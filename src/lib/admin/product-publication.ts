import { and, count, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { associationsTable as associations } from "@/db/schema/associations";
import { categoriesTable as categories } from "@/db/schema/categories";
import { productPresentationsTable as productPresentations } from "@/db/schema/productPresentations";
import { productsTable as products } from "@/db/schema/products";
import { getEditableProduct } from "@/lib/admin/product-mutations";
import type { AdminProfile } from "@/lib/auth/get-current-profile";

export type ProductStatus = "DRAFT" | "PUBLISHED" | "PAUSED";

/**
 * Allowed lifecycle: DRAFT → PUBLISHED → PAUSED → PUBLISHED. A product never
 * goes back to draft, so its published slug and date stay meaningful.
 */
const transitions: Record<ProductStatus, ProductStatus[]> = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["PAUSED"],
  PAUSED: ["PUBLISHED"],
};

export function canTransition(from: ProductStatus, to: ProductStatus) {
  return transitions[from].includes(to);
}

export type PublicationRequirement = {
  id: "name" | "category" | "association" | "presentation";
  label: string;
  met: boolean;
};

type PublicationFacts = {
  name: string;
  categoryIsActive: boolean;
  associationIsActive: boolean;
  availablePresentations: number;
};

/** Minimum conditions for a product to appear in the storefront. */
export function getPublicationRequirements(
  facts: PublicationFacts,
): PublicationRequirement[] {
  const name = facts.name.trim();

  return [
    {
      id: "name",
      label: "Tiene nombre",
      met: name.length > 0 && name.length <= 200,
    },
    {
      id: "category",
      label: "Su categoría está activa",
      met: facts.categoryIsActive,
    },
    {
      id: "association",
      label: "Su asociación está activa",
      met: facts.associationIsActive,
    },
    {
      id: "presentation",
      label: "Tiene al menos una presentación disponible",
      met: facts.availablePresentations > 0,
    },
  ];
}

const hasAvailablePresentation = sql`exists (
  select 1 from ${productPresentations}
  where ${productPresentations.productId} = ${products.id}
    and ${productPresentations.isAvailable}
)`;

/**
 * Publication state of a product the profile may manage, with the
 * requirements to publish it; null when the product is out of scope.
 */
export async function getProductPublication(
  profile: AdminProfile,
  productId: string,
) {
  const product = await getEditableProduct(profile, productId);

  if (!product) {
    return null;
  }

  const [[facts], [{ availablePresentations }]] = await Promise.all([
    db
      .select({
        publishedAt: products.publishedAt,
        categoryIsActive: categories.isActive,
        associationStatus: associations.status,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(associations, eq(products.associationId, associations.id))
      .where(eq(products.id, product.id)),
    db
      .select({ availablePresentations: count() })
      .from(productPresentations)
      .where(
        and(
          eq(productPresentations.productId, product.id),
          eq(productPresentations.isAvailable, true),
        ),
      ),
  ]);

  const requirements = getPublicationRequirements({
    name: product.name,
    categoryIsActive: facts.categoryIsActive,
    associationIsActive: facts.associationStatus === "ACTIVE",
    availablePresentations,
  });

  return {
    status: product.status,
    publishedAt: facts.publishedAt,
    categoryIsActive: facts.categoryIsActive,
    associationIsActive: facts.associationStatus === "ACTIVE",
    availablePresentations,
    requirements,
    meetsRequirements: requirements.every(({ met }) => met),
  };
}

export type ProductPublication = NonNullable<
  Awaited<ReturnType<typeof getProductPublication>>
>;

export type StatusChangeResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "NOT_FOUND"
        | "INVALID_TRANSITION"
        | "REQUIREMENTS_NOT_MET"
        | "CONFLICT";
    };

/**
 * Moves a product along its lifecycle. `publishedAt` is set on the first
 * publication only, so republishing a paused product keeps the original date.
 */
export async function changeProductStatus(
  profile: AdminProfile,
  productId: string,
  target: ProductStatus,
): Promise<StatusChangeResult> {
  const publication = await getProductPublication(profile, productId);

  if (!publication) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  if (!canTransition(publication.status, target)) {
    return { ok: false, reason: "INVALID_TRANSITION" };
  }

  const publishing = target === "PUBLISHED";

  if (publishing && !publication.meetsRequirements) {
    return { ok: false, reason: "REQUIREMENTS_NOT_MET" };
  }

  // The status and presentation checks repeat in the update so a concurrent
  // change cannot slip in between the read above and this write.
  const updated = await db
    .update(products)
    .set({
      status: target,
      ...(publishing && {
        publishedAt: sql`coalesce(${products.publishedAt}, now())`,
      }),
      updatedBy: profile.id,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(products.id, productId),
        eq(products.status, publication.status),
        publishing ? hasAvailablePresentation : undefined,
      ),
    )
    .returning({ id: products.id });

  return updated.length > 0 ? { ok: true } : { ok: false, reason: "CONFLICT" };
}
