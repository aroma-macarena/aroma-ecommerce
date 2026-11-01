import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { categoriesTable } from "@/db/schema/categories";
import { productsTable } from "@/db/schema/products";
import {
  createCategory,
  deleteUnusedCategory,
  getAdminCategories,
  getEditableCategory,
  parseCategoryForm,
  setCategoryActive,
  updateCategory,
} from "@/lib/admin/categories";
import { getProductFormOptions } from "@/lib/admin/product-mutations";
import { getCatalogProducts, getPublicProduct } from "@/lib/catalog/queries";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import {
  bosqueVivoAdmin,
  ids,
  seedAdminProfiles,
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

const { coffee, inactivePreserves } = ids.categories;

function testDatabase() {
  return database.current as TestDatabase;
}

async function findCategory(slug: string) {
  const [category] = await testDatabase()
    .db.select()
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, slug));
  return category;
}

beforeAll(async () => {
  const created = await createTestDatabase();
  database.current = created;
  await seedCatalog(created);
  await seedAdminProfiles(created);
  await seedProducts(created, [
    {
      slug: "cafe",
      associationId: ids.associations.bosqueVivo,
      status: "PUBLISHED",
    },
    {
      slug: "tostado",
      associationId: ids.associations.bosqueVivo,
      status: "DRAFT",
    },
  ]);
});

beforeEach(async () => {
  await setCategoryActive(superAdmin, coffee, true);
  await updateCategory(superAdmin, coffee, { name: "Café", description: null });
});

describe("parseCategoryForm", () => {
  it("requires a name and keeps the description optional", () => {
    expect(parseCategoryForm({ name: " " })).toMatchObject({
      success: false,
      fieldErrors: { name: expect.any(String) },
    });
    expect(parseCategoryForm({ name: " Miel ", description: "" })).toEqual({
      success: true,
      data: { name: "Miel", description: null },
    });
  });
});

describe("getAdminCategories", () => {
  it("lists categories with their product usage", async () => {
    const list = await getAdminCategories(superAdmin);

    expect(list?.find(({ id }) => id === coffee)).toMatchObject({
      isActive: true,
      productCount: 2,
      publishedCount: 1,
    });
    expect(list?.find(({ id }) => id === inactivePreserves)).toMatchObject({
      isActive: false,
      productCount: 0,
    });
  });

  it("is only for super administrators", async () => {
    await expect(getAdminCategories(bosqueVivoAdmin)).resolves.toBeNull();
    await expect(
      getEditableCategory(bosqueVivoAdmin, coffee),
    ).resolves.toBeNull();
  });
});

describe("createCategory", () => {
  it("creates an active category with a slug from its name", async () => {
    await expect(
      createCategory(superAdmin, {
        name: "Frutas y verduras",
        description: "Cosecha de temporada.",
      }),
    ).resolves.toEqual({ ok: true });

    expect(await findCategory("frutas-y-verduras")).toMatchObject({
      isActive: true,
      description: "Cosecha de temporada.",
    });
  });

  it("adds a suffix when the slug is taken", async () => {
    await createCategory(superAdmin, { name: "Café!", description: null });

    expect(await findCategory("cafe-2")).toMatchObject({ name: "Café!" });
  });

  it("rejects a name that already exists, ignoring case", async () => {
    await expect(
      createCategory(superAdmin, { name: "CAFÉ", description: null }),
    ).resolves.toMatchObject({
      ok: false,
      reason: "INVALID",
      fieldErrors: { name: "Ya existe una categoría con ese nombre." },
    });
  });

  it("is only for super administrators", async () => {
    await expect(
      createCategory(bosqueVivoAdmin, { name: "Miel", description: null }),
    ).resolves.toEqual({ ok: false, reason: "FORBIDDEN" });
  });

  it("rejects a duplicate name the earlier check missed", async () => {
    // Simulates a concurrent request that commits right after the check.
    const { db } = testDatabase();
    vi.spyOn(db, "select").mockImplementationOnce(
      () =>
        ({
          from: () => ({ where: () => ({ limit: async () => [] }) }),
        }) as unknown as ReturnType<typeof db.select>,
    );

    await expect(
      createCategory(superAdmin, { name: "conservas", description: null }),
    ).resolves.toMatchObject({ ok: false, reason: "INVALID" });
  });
});

describe("updateCategory", () => {
  it("renames a category keeping its slug and its products", async () => {
    await expect(
      updateCategory(superAdmin, coffee, {
        name: "Café de origen",
        description: "Granos y molidos.",
      }),
    ).resolves.toEqual({ ok: true });

    expect(await findCategory("cafe")).toMatchObject({
      name: "Café de origen",
      description: "Granos y molidos.",
    });
    await expect(
      getPublicProduct("bosque-vivo", "cafe"),
    ).resolves.toMatchObject({
      categoryName: "Café de origen",
      categorySlug: "cafe",
    });
  });

  it("keeps its own name but not another category's", async () => {
    await expect(
      updateCategory(superAdmin, coffee, {
        name: "café",
        description: null,
      }),
    ).resolves.toEqual({ ok: true });
    await expect(
      updateCategory(superAdmin, coffee, {
        name: "Conservas",
        description: null,
      }),
    ).resolves.toMatchObject({ ok: false, reason: "INVALID" });
  });

  it("is only for super administrators and known categories", async () => {
    await expect(
      updateCategory(bosqueVivoAdmin, coffee, { name: "X", description: null }),
    ).resolves.toEqual({ ok: false, reason: "FORBIDDEN" });
    await expect(
      updateCategory(superAdmin, "00000000-0000-4000-8000-00000000ffff", {
        name: "X",
        description: null,
      }),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
  });
});

describe("setCategoryActive", () => {
  it("is only for super administrators", async () => {
    await expect(
      setCategoryActive(bosqueVivoAdmin, coffee, false),
    ).resolves.toEqual({ ok: false, reason: "FORBIDDEN" });
    expect((await findCategory("cafe")).isActive).toBe(true);
  });

  it("hides its products and keeps it out of new products without deleting anything", async () => {
    await expect(setCategoryActive(superAdmin, coffee, false)).resolves.toEqual(
      { ok: true },
    );

    await expect(getCatalogProducts()).resolves.toEqual([]);
    await expect(getPublicProduct("bosque-vivo", "cafe")).resolves.toBeNull();
    expect(
      (await getProductFormOptions(superAdmin)).categoryOptions.map(
        ({ id }) => id,
      ),
    ).not.toContain(coffee);
    expect(
      (await getProductFormOptions(superAdmin, coffee)).categoryOptions,
    ).toContainEqual(expect.objectContaining({ id: coffee, isActive: false }));
    expect(
      await testDatabase()
        .db.select({ id: productsTable.id })
        .from(productsTable)
        .where(eq(productsTable.categoryId, coffee)),
    ).toHaveLength(2);

    await setCategoryActive(superAdmin, coffee, true);

    await expect(getCatalogProducts()).resolves.toMatchObject([
      { slug: "cafe" },
    ]);
  });
});

describe("deleteUnusedCategory", () => {
  it("does not delete a category in use", async () => {
    await expect(deleteUnusedCategory(superAdmin, coffee)).resolves.toEqual({
      ok: false,
      reason: "IN_USE",
    });
    expect(await findCategory("cafe")).toBeDefined();
  });

  it("deletes a category no product uses", async () => {
    await createCategory(superAdmin, { name: "Por error", description: null });
    const { id } = await findCategory("por-error");

    await expect(deleteUnusedCategory(bosqueVivoAdmin, id)).resolves.toEqual({
      ok: false,
      reason: "FORBIDDEN",
    });
    await expect(deleteUnusedCategory(superAdmin, id)).resolves.toEqual({
      ok: true,
    });
    expect(await findCategory("por-error")).toBeUndefined();
  });
});
