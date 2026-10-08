import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { associationsTable as associations } from "@/db/schema/associations";
import { categoriesTable as categories } from "@/db/schema/categories";
import { productImagesTable as productImages } from "@/db/schema/productImages";
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

export async function getCatalogProducts(categorySlug?: string) {
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
      ),
    )
    .orderBy(
      sql`${products.publishedAt} desc nulls last`,
      desc(products.createdAt),
    );
}
