import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { associationsTable as associations } from "@/db/schema/associations";
import { categoriesTable as categories } from "@/db/schema/categories";
import { productImagesTable as productImages } from "@/db/schema/productImages";
import { productPresentationsTable as productPresentations } from "@/db/schema/productPresentations";
import { productsTable as products } from "@/db/schema/products";

const isPubliclyVisible = and(
  eq(products.status, "PUBLISHED"),
  eq(associations.status, "ACTIVE"),
  eq(categories.isActive, true),
);

export type CatalogProduct = Awaited<
  ReturnType<typeof getCatalogProducts>
>[number];

export async function getCatalogCategories() {
  return db
    .selectDistinct({ name: categories.name, slug: categories.slug })
    .from(categories)
    .innerJoin(products, eq(products.categoryId, categories.id))
    .innerJoin(associations, eq(products.associationId, associations.id))
    .where(isPubliclyVisible)
    .orderBy(asc(categories.name));
}

export async function getCatalogProducts({
  categorySlug,
  associationSlug,
}: { categorySlug?: string; associationSlug?: string } = {}) {
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      associationName: associations.name,
      associationSlug: associations.slug,
      categoryName: categories.name,
      imageObjectKey: productImages.objectKey,
      imageAltText: productImages.altText,
    })
    .from(products)
    .innerJoin(associations, eq(products.associationId, associations.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(productImages.isPrimary, true),
      ),
    )
    .where(
      and(
        isPubliclyVisible,
        categorySlug ? eq(categories.slug, categorySlug) : undefined,
        associationSlug ? eq(associations.slug, associationSlug) : undefined,
      ),
    )
    .orderBy(
      sql`${products.publishedAt} desc nulls last`,
      desc(products.createdAt),
    );
}

/**
 * A product as the public sees it, found by its association and product
 * slugs. Null unless the product, its association and its category are all
 * public, so drafts and paused products look the same as missing ones.
 */
export async function getPublicProduct(
  associationSlug: string,
  productSlug: string,
) {
  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      description: products.description,
      origin: products.origin,
      ingredients: products.ingredients,
      availabilityNote: products.availabilityNote,
      categoryName: categories.name,
      categorySlug: categories.slug,
      association: {
        name: associations.name,
        slug: associations.slug,
        description: associations.description,
        location: associations.location,
        whatsappNumber: associations.whatsappNumber,
      },
    })
    .from(products)
    .innerJoin(associations, eq(products.associationId, associations.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        isPubliclyVisible,
        eq(associations.slug, associationSlug),
        eq(products.slug, productSlug),
      ),
    )
    .limit(1);

  if (!product) {
    return null;
  }

  const [images, presentations] = await Promise.all([
    db
      .select({
        id: productImages.id,
        objectKey: productImages.objectKey,
        altText: productImages.altText,
      })
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(
        desc(productImages.isPrimary),
        asc(productImages.displayOrder),
        asc(productImages.createdAt),
        asc(productImages.id),
      ),
    db
      .select({
        id: productPresentations.id,
        name: productPresentations.name,
        quantity: productPresentations.quantity,
        unit: productPresentations.unit,
        referencePrice: productPresentations.referencePrice,
      })
      .from(productPresentations)
      .where(
        and(
          eq(productPresentations.productId, product.id),
          eq(productPresentations.isAvailable, true),
        ),
      )
      .orderBy(
        asc(productPresentations.displayOrder),
        asc(productPresentations.createdAt),
        asc(productPresentations.id),
      ),
  ]);

  return { ...product, images, presentations };
}

export type PublicProduct = NonNullable<
  Awaited<ReturnType<typeof getPublicProduct>>
>;

/** Active associations for the public directory, with their product counts. */
export async function getPublicAssociations() {
  return db
    .select({
      name: associations.name,
      slug: associations.slug,
      description: associations.description,
      location: associations.location,
      logoObjectKey: associations.logoObjectKey,
      // Explicit aliases: in a single-table select Drizzle leaves columns
      // unqualified, which would be ambiguous inside this subquery.
      productCount: sql<number>`(
        select count(*)::int from products as p
        inner join categories as c on c.id = p.category_id
        where p.association_id = "associations"."id"
          and p.status = 'PUBLISHED'
          and c.is_active
      )`,
    })
    .from(associations)
    .where(eq(associations.status, "ACTIVE"))
    .orderBy(asc(associations.name));
}

export type PublicAssociationSummary = Awaited<
  ReturnType<typeof getPublicAssociations>
>[number];

/**
 * An active association's public profile with its public products, or null
 * for inactive or unknown slugs. The contact person's name stays private;
 * only the WhatsApp number is used, to open a chat.
 */
export async function getPublicAssociation(slug: string) {
  const [association] = await db
    .select({
      name: associations.name,
      slug: associations.slug,
      description: associations.description,
      history: associations.history,
      location: associations.location,
      whatsappNumber: associations.whatsappNumber,
      logoObjectKey: associations.logoObjectKey,
      coverObjectKey: associations.coverObjectKey,
    })
    .from(associations)
    .where(and(eq(associations.slug, slug), eq(associations.status, "ACTIVE")))
    .limit(1);

  if (!association) {
    return null;
  }

  return {
    ...association,
    products: await getCatalogProducts({ associationSlug: association.slug }),
  };
}

export type PublicAssociation = NonNullable<
  Awaited<ReturnType<typeof getPublicAssociation>>
>;
