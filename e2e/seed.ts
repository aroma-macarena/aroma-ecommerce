import type { PgliteDatabase } from "drizzle-orm/pglite";

import { associationsTable } from "../src/db/schema/associations";
import { categoriesTable } from "../src/db/schema/categories";
import { productPresentationsTable } from "../src/db/schema/productPresentations";
import { productsTable } from "../src/db/schema/products";
import { E2E_WHATSAPP_NUMBER } from "./environment";

/**
 * The data every end-to-end run starts from. Fixed ids and texts, so the
 * journeys are deterministic; the specs refer to it through `e2eData`.
 */
export const e2eData = {
  association: {
    id: "e2e00000-0000-4000-8000-00000000a001",
    name: "Asociación Raíces del Guayabero",
    slug: "raices-del-guayabero",
  },
  category: {
    id: "e2e00000-0000-4000-8000-00000000c001",
    name: "Café",
    slug: "cafe",
  },
  product: {
    id: "e2e00000-0000-4000-8000-00000000b001",
    name: "Café de la Sierra",
    slug: "cafe-de-la-sierra",
  },
  draftProduct: {
    id: "e2e00000-0000-4000-8000-00000000b002",
    name: "Mermelada en preparación",
    slug: "mermelada-en-preparacion",
  },
} as const;

export async function seedE2eDatabase(db: PgliteDatabase) {
  const { association, category, product, draftProduct } = e2eData;

  await db.insert(associationsTable).values({
    id: association.id,
    name: association.name,
    slug: association.slug,
    location: "La Macarena, Meta",
    description: "Mujeres campesinas que cultivan café a orillas del río.",
    whatsappNumber: E2E_WHATSAPP_NUMBER,
  });

  await db.insert(categoriesTable).values({
    id: category.id,
    name: category.name,
    slug: category.slug,
  });

  await db.insert(productsTable).values([
    {
      id: product.id,
      associationId: association.id,
      categoryId: category.id,
      name: product.name,
      slug: product.slug,
      shortDescription: "Café de altura secado al sol.",
      description: "Granos seleccionados a mano y tostados en la vereda.",
      origin: "La Macarena, Meta",
      status: "PUBLISHED",
      publishedAt: new Date("2026-01-15T15:00:00Z"),
    },
    {
      id: draftProduct.id,
      associationId: association.id,
      categoryId: category.id,
      name: draftProduct.name,
      slug: draftProduct.slug,
      status: "DRAFT",
    },
  ]);

  await db.insert(productPresentationsTable).values({
    productId: product.id,
    name: "Bolsa 500 g",
    quantity: "500",
    unit: "g",
    referencePrice: "45000",
  });
}
