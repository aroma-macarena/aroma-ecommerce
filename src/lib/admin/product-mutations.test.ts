import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { productsTable } from "@/db/schema/products";
import type { ProductFormInput } from "@/lib/admin/product-form";
import {
  createProduct,
  getEditableProduct,
  getProductFormOptions,
  updateProduct,
} from "@/lib/admin/product-mutations";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import {
  bosqueVivoAdmin,
  ids,
  saboresAdmin,
  seedCatalog,
  seedProfiles,
  superAdmin,
} from "@/test/fixtures";

const database = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@/db", () => ({
  get db() {
    return (database.current as TestDatabase).db;
  },
}));

const { bosqueVivo, sabores, inactive } = ids.associations;
const { coffee, inactivePreserves } = ids.categories;

function input(overrides: Partial<ProductFormInput> = {}): ProductFormInput {
  return {
    name: "Café artesanal",
    categoryId: coffee,
    shortDescription: null,
    description: null,
    origin: null,
    ingredients: null,
    availabilityNote: null,
    ...overrides,
  };
}

async function findProduct(productId: string) {
  const { db } = database.current as TestDatabase;
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId));
  return product;
}

async function createOrFail(...args: Parameters<typeof createProduct>) {
  const result = await createProduct(...args);

  if (!result.ok) {
    throw new Error(`Expected product creation to succeed: ${result.reason}`);
  }

  return findProduct(result.productId);
}

beforeAll(async () => {
  const testDatabase = await createTestDatabase();
  database.current = testDatabase;
  await seedCatalog(testDatabase);
  await seedProfiles(
    testDatabase,
    [superAdmin, bosqueVivoAdmin, saboresAdmin].map(
      ({ id, name, email, role, associationId }) => ({
        id,
        authUserId: `user_${id}`,
        name,
        email,
        role,
        associationId,
      }),
    ),
  );
});

beforeEach(async () => {
  await (database.current as TestDatabase).db.delete(productsTable);
});

describe("createProduct", () => {
  it("creates a draft owned by the association administrator", async () => {
    const product = await createOrFail(bosqueVivoAdmin, input());

    expect(product).toMatchObject({
      associationId: bosqueVivo,
      status: "DRAFT",
      slug: "cafe-artesanal",
      createdBy: bosqueVivoAdmin.id,
      updatedBy: bosqueVivoAdmin.id,
    });
  });

  it("ignores another association sent by an association administrator", async () => {
    const product = await createOrFail(
      bosqueVivoAdmin,
      input({ associationId: sabores }),
    );

    expect(product.associationId).toBe(bosqueVivo);
  });

  it("lets a super administrator choose an active association", async () => {
    const product = await createOrFail(
      superAdmin,
      input({ associationId: sabores }),
    );

    expect(product.associationId).toBe(sabores);
  });

  it("requires super administrators to choose an association", async () => {
    await expect(createProduct(superAdmin, input())).resolves.toMatchObject({
      ok: false,
      fieldErrors: { associationId: expect.any(String) },
    });
  });

  it("rejects inactive associations", async () => {
    await expect(
      createProduct(superAdmin, input({ associationId: inactive })),
    ).resolves.toMatchObject({
      ok: false,
      fieldErrors: { associationId: expect.any(String) },
    });
  });

  it("rejects inactive or unknown categories", async () => {
    for (const categoryId of [inactivePreserves, "not-a-uuid"]) {
      await expect(
        createProduct(bosqueVivoAdmin, input({ categoryId })),
      ).resolves.toMatchObject({
        ok: false,
        fieldErrors: { categoryId: expect.any(String) },
      });
    }
  });

  it("keeps slugs unique within an association", async () => {
    const first = await createOrFail(bosqueVivoAdmin, input());
    const second = await createOrFail(bosqueVivoAdmin, input());

    expect(first.slug).toBe("cafe-artesanal");
    expect(second.slug).toBe("cafe-artesanal-2");
  });

  it("keeps long slugs unique when the suffix shortens them", async () => {
    const name = "a".repeat(200);
    const slugs = [];

    for (let count = 0; count < 3; count++) {
      slugs.push((await createOrFail(bosqueVivoAdmin, input({ name }))).slug);
    }

    expect(slugs).toEqual([
      "a".repeat(200),
      `${"a".repeat(198)}-2`,
      `${"a".repeat(198)}-3`,
    ]);
  });

  it("allows the same slug in different associations", async () => {
    const own = await createOrFail(bosqueVivoAdmin, input());
    const other = await createOrFail(saboresAdmin, input());

    expect(own.slug).toBe(other.slug);
  });
});

describe("getEditableProduct", () => {
  it("returns products of the administrator's association", async () => {
    const product = await createOrFail(bosqueVivoAdmin, input());

    await expect(
      getEditableProduct(bosqueVivoAdmin, product.id),
    ).resolves.toMatchObject({ id: product.id });
    await expect(
      getEditableProduct(superAdmin, product.id),
    ).resolves.toMatchObject({ id: product.id });
  });

  it("hides products of other associations and invalid ids", async () => {
    const product = await createOrFail(bosqueVivoAdmin, input());

    await expect(
      getEditableProduct(saboresAdmin, product.id),
    ).resolves.toBeNull();
    await expect(
      getEditableProduct(superAdmin, "not-a-uuid"),
    ).resolves.toBeNull();
  });
});

describe("updateProduct", () => {
  it("updates fields and records who changed the product", async () => {
    const product = await createOrFail(bosqueVivoAdmin, input());

    await updateProduct(
      superAdmin,
      product.id,
      input({ shortDescription: "Tostión media", origin: "La Macarena" }),
    );

    expect(await findProduct(product.id)).toMatchObject({
      shortDescription: "Tostión media",
      origin: "La Macarena",
      createdBy: bosqueVivoAdmin.id,
      updatedBy: superAdmin.id,
      updatedAt: expect.any(Date),
    });
  });

  it("refuses products outside the administrator's association", async () => {
    const product = await createOrFail(bosqueVivoAdmin, input());

    await expect(
      updateProduct(saboresAdmin, product.id, input({ name: "Cambio" })),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    expect((await findProduct(product.id)).name).toBe("Café artesanal");
  });

  it("never moves a product to another association", async () => {
    const product = await createOrFail(bosqueVivoAdmin, input());

    await updateProduct(
      superAdmin,
      product.id,
      input({ associationId: sabores }),
    );

    expect((await findProduct(product.id)).associationId).toBe(bosqueVivo);
  });

  it("updates the slug of a draft when its name changes", async () => {
    const product = await createOrFail(bosqueVivoAdmin, input());

    await updateProduct(
      bosqueVivoAdmin,
      product.id,
      input({ name: "Café de origen" }),
    );

    expect((await findProduct(product.id)).slug).toBe("cafe-de-origen");
  });

  it("keeps the slug of a published product", async () => {
    const product = await createOrFail(bosqueVivoAdmin, input());
    const { db } = database.current as TestDatabase;
    await db
      .update(productsTable)
      .set({ status: "PUBLISHED" })
      .where(eq(productsTable.id, product.id));

    await updateProduct(
      bosqueVivoAdmin,
      product.id,
      input({ name: "Café de origen" }),
    );

    expect(await findProduct(product.id)).toMatchObject({
      name: "Café de origen",
      slug: "cafe-artesanal",
    });
  });

  it("keeps a current category that was deactivated, but not a new one", async () => {
    const { db } = database.current as TestDatabase;
    const product = await createOrFail(bosqueVivoAdmin, input());
    await db
      .update(productsTable)
      .set({ categoryId: inactivePreserves })
      .where(eq(productsTable.id, product.id));

    await expect(
      updateProduct(
        bosqueVivoAdmin,
        product.id,
        input({ categoryId: inactivePreserves, name: "Mermelada" }),
      ),
    ).resolves.toMatchObject({ ok: true });

    const other = await createOrFail(bosqueVivoAdmin, input({ name: "Otro" }));
    await expect(
      updateProduct(
        bosqueVivoAdmin,
        other.id,
        input({ categoryId: inactivePreserves }),
      ),
    ).resolves.toMatchObject({
      ok: false,
      fieldErrors: { categoryId: expect.any(String) },
    });
  });
});

describe("getProductFormOptions", () => {
  it("offers active categories and, to super administrators, active associations", async () => {
    const options = await getProductFormOptions(superAdmin);

    expect(options.categoryOptions.map(({ id }) => id)).toEqual([coffee]);
    expect(options.associationOptions.map(({ id }) => id).sort()).toEqual(
      [bosqueVivo, sabores].sort(),
    );
  });

  it("includes the current inactive category when editing", async () => {
    const options = await getProductFormOptions(
      bosqueVivoAdmin,
      inactivePreserves,
    );

    expect(options.categoryOptions.map(({ id }) => id).sort()).toEqual(
      [coffee, inactivePreserves].sort(),
    );
    expect(options.associationOptions).toEqual([]);
  });
});
