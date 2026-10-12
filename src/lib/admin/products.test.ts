import { beforeAll, describe, expect, it, vi } from "vitest";

import { getAdminProducts } from "@/lib/admin/products";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import {
  bosqueVivoAdmin,
  ids,
  saboresAdmin,
  seedCatalog,
  seedProducts,
  superAdmin,
} from "@/test/fixtures";

const database = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@/db", () => ({
  get db() {
    return (database.current as TestDatabase).db;
  },
}));

const { bosqueVivo, sabores, inactive } = ids.associations;

beforeAll(async () => {
  const testDatabase = await createTestDatabase();
  database.current = testDatabase;

  await seedCatalog(testDatabase);
  await seedProducts(testDatabase, [
    { slug: "bosque-borrador", associationId: bosqueVivo, status: "DRAFT" },
    {
      slug: "bosque-publicado",
      associationId: bosqueVivo,
      status: "PUBLISHED",
    },
    { slug: "bosque-pausado", associationId: bosqueVivo, status: "PAUSED" },
    { slug: "sabores-borrador", associationId: sabores, status: "DRAFT" },
    { slug: "sabores-publicado", associationId: sabores, status: "PUBLISHED" },
    { slug: "sabores-pausado", associationId: sabores, status: "PAUSED" },
    {
      slug: "sabores-categoria-inactiva",
      associationId: sabores,
      status: "PUBLISHED",
      categoryId: ids.categories.inactivePreserves,
    },
    {
      slug: "inactiva-publicado",
      associationId: inactive,
      status: "PUBLISHED",
    },
  ]);
});

function slugsOf(products: { slug: string }[]) {
  return products.map(({ slug }) => slug).sort();
}

describe("getAdminProducts", () => {
  describe("for a super administrator", () => {
    it("returns every product in every state and association", async () => {
      const products = await getAdminProducts(superAdmin);

      expect(products).toHaveLength(8);
      expect(slugsOf(products)).toContain("bosque-borrador");
      expect(slugsOf(products)).toContain("sabores-pausado");
      expect(slugsOf(products)).toContain("inactiva-publicado");
    });

    it("marks every product as manageable", async () => {
      const products = await getAdminProducts(superAdmin);

      expect(products.every(({ canManage }) => canManage)).toBe(true);
    });
  });

  describe("for an association administrator", () => {
    it("returns their products in every state", async () => {
      const products = await getAdminProducts(bosqueVivoAdmin);
      const own = products.filter(
        ({ associationId }) => associationId === bosqueVivo,
      );

      expect(slugsOf(own)).toEqual([
        "bosque-borrador",
        "bosque-pausado",
        "bosque-publicado",
      ]);
    });

    it("returns only published products of other active associations", async () => {
      const products = await getAdminProducts(bosqueVivoAdmin);
      const others = products.filter(
        ({ associationId }) => associationId !== bosqueVivo,
      );

      expect(slugsOf(others)).toEqual([
        "sabores-categoria-inactiva",
        "sabores-publicado",
      ]);
    });

    it("hides drafts and paused products of other associations", async () => {
      const slugs = slugsOf(await getAdminProducts(bosqueVivoAdmin));

      expect(slugs).not.toContain("sabores-borrador");
      expect(slugs).not.toContain("sabores-pausado");
    });

    it("hides published products of inactive associations", async () => {
      const slugs = slugsOf(await getAdminProducts(bosqueVivoAdmin));

      expect(slugs).not.toContain("inactiva-publicado");
    });

    it("keeps products with an inactive category, flagged as such", async () => {
      const products = await getAdminProducts(bosqueVivoAdmin);
      const product = products.find(
        ({ slug }) => slug === "sabores-categoria-inactiva",
      );

      expect(product?.categoryIsActive).toBe(false);
    });

    it("marks only their own products as manageable", async () => {
      const products = await getAdminProducts(bosqueVivoAdmin);

      for (const product of products) {
        expect(product.canManage).toBe(product.associationId === bosqueVivo);
      }
    });

    it("applies the same rules from another association's point of view", async () => {
      const products = await getAdminProducts(saboresAdmin);

      expect(slugsOf(products)).toEqual([
        "bosque-publicado",
        "sabores-borrador",
        "sabores-categoria-inactiva",
        "sabores-pausado",
        "sabores-publicado",
      ]);
    });
  });
});
