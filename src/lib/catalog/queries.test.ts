import { beforeAll, describe, expect, it, vi } from "vitest";

import { productImagesTable } from "@/db/schema/productImages";
import {
  getCatalogProducts,
  getPublicAssociation,
  getPublicAssociations,
  getPublicProduct,
} from "@/lib/catalog/queries";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import {
  ids,
  seedCatalog,
  seedPresentations,
  seedProducts,
} from "@/test/fixtures";

const database = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@/db", () => ({
  get db() {
    return (database.current as TestDatabase).db;
  },
}));

const { bosqueVivo, sabores, inactive } = ids.associations;

let publishedId: string;

beforeAll(async () => {
  const testDatabase = await createTestDatabase();
  database.current = testDatabase;
  await seedCatalog(testDatabase);

  [{ id: publishedId }] = await seedProducts(testDatabase, [
    { slug: "cafe", associationId: bosqueVivo, status: "PUBLISHED" },
  ]);
  await seedProducts(testDatabase, [
    { slug: "borrador", associationId: bosqueVivo, status: "DRAFT" },
    { slug: "pausado", associationId: bosqueVivo, status: "PAUSED" },
    { slug: "cafe", associationId: sabores, status: "DRAFT" },
    { slug: "inactiva", associationId: inactive, status: "PUBLISHED" },
    {
      slug: "conserva",
      associationId: bosqueVivo,
      status: "PUBLISHED",
      categoryId: ids.categories.inactivePreserves,
    },
  ]);

  await seedPresentations(testDatabase, [
    { productId: publishedId, name: "Bolsa 500 g", displayOrder: 1 },
    { productId: publishedId, name: "Muestra", isAvailable: false },
    {
      productId: publishedId,
      name: "Bolsa 250 g",
      quantity: "250",
      unit: "g",
      referencePrice: "25000",
      displayOrder: 0,
    },
  ]);
  await testDatabase.db.insert(productImagesTable).values([
    { productId: publishedId, objectKey: "a.webp", displayOrder: 0 },
    {
      productId: publishedId,
      objectKey: "principal.webp",
      displayOrder: 1,
      isPrimary: true,
    },
  ]);
});

describe("getPublicProduct", () => {
  it("finds a published product by its association and product slugs", async () => {
    await expect(
      getPublicProduct("bosque-vivo", "cafe"),
    ).resolves.toMatchObject({
      id: publishedId,
      categoryName: "Café",
      association: { name: "Asociación Bosque Vivo", slug: "bosque-vivo" },
    });
  });

  it("does not expose drafts, paused products or hidden owners", async () => {
    for (const [association, product] of [
      ["bosque-vivo", "borrador"],
      ["bosque-vivo", "pausado"],
      ["sabores-macarena", "cafe"],
      ["asociacion-inactiva", "inactiva"],
      ["bosque-vivo", "conserva"],
      ["sabores-macarena", "borrador"],
      ["bosque-vivo", "no-existe"],
    ]) {
      await expect(getPublicProduct(association, product)).resolves.toBeNull();
    }
  });

  it("lists only available presentations, in their order", async () => {
    const product = await getPublicProduct("bosque-vivo", "cafe");

    expect(product?.presentations).toMatchObject([
      { name: "Bolsa 250 g", quantity: "250.000", referencePrice: "25000.00" },
      { name: "Bolsa 500 g", quantity: null, referencePrice: null },
    ]);
  });

  it("puts the primary image first", async () => {
    const product = await getPublicProduct("bosque-vivo", "cafe");

    expect(product?.images.map(({ objectKey }) => objectKey)).toEqual([
      "principal.webp",
      "a.webp",
    ]);
  });
});

describe("getPublicAssociations", () => {
  it("lists active associations by name with their public product counts", async () => {
    await expect(getPublicAssociations()).resolves.toMatchObject([
      { slug: "bosque-vivo", productCount: 1 },
      { slug: "sabores-macarena", productCount: 0 },
    ]);
  });
});

describe("getPublicAssociation", () => {
  it("returns an active association with only its public products", async () => {
    const association = await getPublicAssociation("bosque-vivo");

    expect(association).toMatchObject({ name: "Asociación Bosque Vivo" });
    expect(association?.products.map(({ slug }) => slug)).toEqual(["cafe"]);
  });

  it("keeps the contact person's name private", async () => {
    const association = await getPublicAssociation("bosque-vivo");

    expect(association).not.toHaveProperty("contactName");
  });

  it("does not find inactive or unknown associations", async () => {
    await expect(
      getPublicAssociation("asociacion-inactiva"),
    ).resolves.toBeNull();
    await expect(getPublicAssociation("no-existe")).resolves.toBeNull();
  });
});

describe("getCatalogProducts", () => {
  it("filters public products by association", async () => {
    await expect(
      getCatalogProducts({ associationSlug: "sabores-macarena" }),
    ).resolves.toEqual([]);
    await expect(
      getCatalogProducts({ associationSlug: "bosque-vivo" }),
    ).resolves.toMatchObject([{ slug: "cafe" }]);
  });
});
