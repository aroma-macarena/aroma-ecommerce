import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { productsTable } from "@/db/schema/products";
import {
  canTransition,
  changeProductStatus,
  getProductPublication,
  getPublicationRequirements,
} from "@/lib/admin/product-publication";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import {
  bosqueVivoAdmin,
  ids,
  saboresAdmin,
  seedAdminProfiles,
  seedCatalog,
  seedPresentations,
  seedProducts,
  superAdmin,
} from "@/test/fixtures";

const database = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@/db", () => ({
  get db() {
    return (database.current as TestDatabase).db;
  },
}));

const { bosqueVivo, inactive } = ids.associations;

function testDatabase() {
  return database.current as TestDatabase;
}

async function seedProduct(
  status: "DRAFT" | "PUBLISHED" | "PAUSED",
  options: {
    available?: boolean;
    associationId?: string;
    categoryId?: string;
    publishedAt?: Date;
  } = {},
) {
  const [{ id }] = await seedProducts(testDatabase(), [
    {
      slug: `producto-${status.toLowerCase()}`,
      associationId: options.associationId ?? bosqueVivo,
      status,
      categoryId: options.categoryId,
      publishedAt: options.publishedAt,
    },
  ]);

  if (options.available !== undefined) {
    await seedPresentations(testDatabase(), [
      { productId: id, name: "Bolsa 250 g", isAvailable: options.available },
    ]);
  }

  return id;
}

async function findProduct(productId: string) {
  const [product] = await testDatabase()
    .db.select()
    .from(productsTable)
    .where(eq(productsTable.id, productId));
  return product;
}

beforeAll(async () => {
  const created = await createTestDatabase();
  database.current = created;
  await seedCatalog(created);
  await seedAdminProfiles(created);
});

beforeEach(async () => {
  await testDatabase().db.delete(productsTable);
});

describe("canTransition", () => {
  it("follows DRAFT → PUBLISHED → PAUSED → PUBLISHED", () => {
    expect(canTransition("DRAFT", "PUBLISHED")).toBe(true);
    expect(canTransition("PUBLISHED", "PAUSED")).toBe(true);
    expect(canTransition("PAUSED", "PUBLISHED")).toBe(true);
  });

  it("never pauses a draft or returns a product to draft", () => {
    expect(canTransition("DRAFT", "PAUSED")).toBe(false);
    expect(canTransition("PUBLISHED", "DRAFT")).toBe(false);
    expect(canTransition("PAUSED", "DRAFT")).toBe(false);
  });
});

describe("getPublicationRequirements", () => {
  const facts = {
    name: "Café",
    categoryIsActive: true,
    associationIsActive: true,
    availablePresentations: 1,
  };

  it("passes with valid information and an available presentation", () => {
    expect(getPublicationRequirements(facts).every(({ met }) => met)).toBe(
      true,
    );
  });

  it("flags each missing condition", () => {
    const unmet = getPublicationRequirements({
      name: "  ",
      categoryIsActive: false,
      associationIsActive: false,
      availablePresentations: 0,
    }).filter(({ met }) => !met);

    expect(unmet.map(({ id }) => id)).toEqual([
      "name",
      "category",
      "association",
      "presentation",
    ]);
  });
});

describe("getProductPublication", () => {
  it("counts only available presentations", async () => {
    const productId = await seedProduct("DRAFT", { available: false });

    await expect(
      getProductPublication(bosqueVivoAdmin, productId),
    ).resolves.toMatchObject({
      availablePresentations: 0,
      meetsRequirements: false,
    });
  });

  it("is null for products outside the profile's scope", async () => {
    const productId = await seedProduct("DRAFT", { available: true });

    await expect(
      getProductPublication(saboresAdmin, productId),
    ).resolves.toBeNull();
  });
});

describe("changeProductStatus", () => {
  it("publishes a valid draft and records the first publication", async () => {
    const productId = await seedProduct("DRAFT", { available: true });

    await expect(
      changeProductStatus(bosqueVivoAdmin, productId, "PUBLISHED"),
    ).resolves.toEqual({ ok: true });

    const product = await findProduct(productId);
    expect(product.status).toBe("PUBLISHED");
    expect(product.publishedAt).toBeInstanceOf(Date);
    expect(product.updatedBy).toBe(bosqueVivoAdmin.id);
  });

  it("does not publish without an available presentation", async () => {
    const productId = await seedProduct("DRAFT", { available: false });

    await expect(
      changeProductStatus(bosqueVivoAdmin, productId, "PUBLISHED"),
    ).resolves.toEqual({ ok: false, reason: "REQUIREMENTS_NOT_MET" });
    expect((await findProduct(productId)).status).toBe("DRAFT");
  });

  it("does not publish with an inactive category", async () => {
    const productId = await seedProduct("DRAFT", {
      available: true,
      categoryId: ids.categories.inactivePreserves,
    });

    await expect(
      changeProductStatus(bosqueVivoAdmin, productId, "PUBLISHED"),
    ).resolves.toEqual({ ok: false, reason: "REQUIREMENTS_NOT_MET" });
  });

  it("does not publish for an inactive association", async () => {
    const productId = await seedProduct("PAUSED", {
      available: true,
      associationId: inactive,
    });

    await expect(
      changeProductStatus(superAdmin, productId, "PUBLISHED"),
    ).resolves.toEqual({ ok: false, reason: "REQUIREMENTS_NOT_MET" });
  });

  it("pauses a published product without touching its data", async () => {
    const publishedAt = new Date("2026-01-10T15:00:00Z");
    const productId = await seedProduct("PUBLISHED", {
      available: true,
      publishedAt,
    });

    await expect(
      changeProductStatus(bosqueVivoAdmin, productId, "PAUSED"),
    ).resolves.toEqual({ ok: true });

    const product = await findProduct(productId);
    expect(product).toMatchObject({ status: "PAUSED", publishedAt });
  });

  it("keeps the original date when republishing a paused product", async () => {
    const publishedAt = new Date("2026-01-10T15:00:00Z");
    const productId = await seedProduct("PAUSED", {
      available: true,
      publishedAt,
    });

    await expect(
      changeProductStatus(superAdmin, productId, "PUBLISHED"),
    ).resolves.toEqual({ ok: true });
    expect(await findProduct(productId)).toMatchObject({
      status: "PUBLISHED",
      publishedAt,
      updatedBy: superAdmin.id,
    });
  });

  it("rejects transitions outside the lifecycle", async () => {
    const draftId = await seedProduct("DRAFT", { available: true });

    await expect(
      changeProductStatus(bosqueVivoAdmin, draftId, "PAUSED"),
    ).resolves.toEqual({ ok: false, reason: "INVALID_TRANSITION" });
    await expect(
      changeProductStatus(bosqueVivoAdmin, draftId, "DRAFT"),
    ).resolves.toEqual({ ok: false, reason: "INVALID_TRANSITION" });
  });

  it("does not let another association change the status", async () => {
    const productId = await seedProduct("DRAFT", { available: true });

    await expect(
      changeProductStatus(saboresAdmin, productId, "PUBLISHED"),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    expect((await findProduct(productId)).status).toBe("DRAFT");
  });
});
