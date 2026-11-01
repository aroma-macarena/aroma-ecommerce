import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { productsTable } from "@/db/schema/products";
import type { PresentationFormInput } from "@/lib/admin/presentation-form";
import {
  createPresentation,
  deletePresentation,
  getEditablePresentation,
  getProductPresentations,
  movePresentation,
  updatePresentation,
} from "@/lib/admin/presentation-mutations";
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

function testDatabase() {
  return database.current as TestDatabase;
}

function input(
  overrides: Partial<PresentationFormInput> = {},
): PresentationFormInput {
  return {
    name: "Bolsa 250 g",
    quantity: "250",
    unit: "g",
    referencePrice: "25000",
    isAvailable: true,
    ...overrides,
  };
}

async function seedProduct(status: "DRAFT" | "PUBLISHED" | "PAUSED") {
  const [{ id }] = await seedProducts(testDatabase(), [
    {
      slug: `cafe-${crypto.randomUUID()}`,
      associationId: ids.associations.bosqueVivo,
      status,
    },
  ]);
  return id;
}

async function seedProductWith(
  status: "DRAFT" | "PUBLISHED" | "PAUSED",
  availability: boolean[],
) {
  const productId = await seedProduct(status);
  const presentations = await seedPresentations(
    testDatabase(),
    availability.map((isAvailable, displayOrder) => ({
      productId,
      name: `Presentación ${displayOrder + 1}`,
      isAvailable,
      displayOrder,
    })),
  );
  return { productId, presentationIds: presentations.map(({ id }) => id) };
}

async function namesOf(productId: string) {
  return (await getProductPresentations(productId)).map(({ name }) => name);
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

describe("createPresentation", () => {
  it("adds presentations at the end and records who changed the product", async () => {
    const productId = await seedProduct("DRAFT");

    await createPresentation(bosqueVivoAdmin, productId, input());
    await createPresentation(
      bosqueVivoAdmin,
      productId,
      input({ name: "Bolsa 500 g", quantity: "500", referencePrice: null }),
    );

    const presentations = await getProductPresentations(productId);
    expect(presentations).toMatchObject([
      {
        name: "Bolsa 250 g",
        quantity: "250.000",
        unit: "g",
        referencePrice: "25000.00",
        displayOrder: 0,
      },
      { name: "Bolsa 500 g", referencePrice: null, displayOrder: 1 },
    ]);
    expect((await findProduct(productId)).updatedBy).toBe(bosqueVivoAdmin.id);
  });

  it("does not add presentations to another association's product", async () => {
    const productId = await seedProduct("DRAFT");

    await expect(
      createPresentation(saboresAdmin, productId, input()),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    expect(await namesOf(productId)).toEqual([]);
  });

  it("respects the database checks for quantity and price", async () => {
    const productId = await seedProduct("DRAFT");

    await expect(
      createPresentation(superAdmin, productId, input({ quantity: "0" })),
    ).rejects.toThrow();
    await expect(
      createPresentation(
        superAdmin,
        productId,
        input({ referencePrice: "-1" }),
      ),
    ).rejects.toThrow();
  });
});

describe("updatePresentation", () => {
  it("updates the presentation fields", async () => {
    const {
      productId,
      presentationIds: [presentationId],
    } = await seedProductWith("DRAFT", [true]);

    await expect(
      updatePresentation(
        bosqueVivoAdmin,
        productId,
        presentationId,
        input({ name: "Frasco 300 ml", unit: "ml", isAvailable: false }),
      ),
    ).resolves.toEqual({ ok: true });

    expect(await getProductPresentations(productId)).toMatchObject([
      { name: "Frasco 300 ml", unit: "ml", isAvailable: false },
    ]);
  });

  it("keeps a published product with an available presentation", async () => {
    const {
      productId,
      presentationIds: [presentationId],
    } = await seedProductWith("PUBLISHED", [true, false]);

    await expect(
      updatePresentation(
        bosqueVivoAdmin,
        productId,
        presentationId,
        input({ isAvailable: false }),
      ),
    ).resolves.toMatchObject({
      ok: false,
      reason: "INVALID",
      fieldErrors: { isAvailable: expect.any(String) },
    });
    expect((await getProductPresentations(productId))[0].isAvailable).toBe(
      true,
    );
  });

  it("lets a paused product run out of available presentations", async () => {
    const {
      productId,
      presentationIds: [presentationId],
    } = await seedProductWith("PAUSED", [true]);

    await expect(
      updatePresentation(
        bosqueVivoAdmin,
        productId,
        presentationId,
        input({ isAvailable: false }),
      ),
    ).resolves.toEqual({ ok: true });
  });

  it("does not update a presentation through another product", async () => {
    const { presentationIds } = await seedProductWith("DRAFT", [true]);
    const otherProductId = (await seedProductWith("DRAFT", [true])).productId;

    await expect(
      updatePresentation(
        bosqueVivoAdmin,
        otherProductId,
        presentationIds[0],
        input(),
      ),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
  });
});

describe("deletePresentation", () => {
  it("deletes a presentation", async () => {
    const { productId, presentationIds } = await seedProductWith("PUBLISHED", [
      true,
      true,
    ]);

    await expect(
      deletePresentation(bosqueVivoAdmin, productId, presentationIds[0]),
    ).resolves.toEqual({ ok: true });
    expect(await namesOf(productId)).toEqual(["Presentación 2"]);
  });

  it("does not delete the last available presentation of a published product", async () => {
    const { productId, presentationIds } = await seedProductWith("PUBLISHED", [
      true,
      false,
    ]);

    await expect(
      deletePresentation(bosqueVivoAdmin, productId, presentationIds[0]),
    ).resolves.toEqual({ ok: false, reason: "LAST_AVAILABLE" });
    await expect(
      deletePresentation(bosqueVivoAdmin, productId, presentationIds[1]),
    ).resolves.toEqual({ ok: true });
  });

  it("reports the last available presentation when editing", async () => {
    const { productId, presentationIds } = await seedProductWith("PUBLISHED", [
      true,
      false,
    ]);

    await expect(
      getEditablePresentation(bosqueVivoAdmin, productId, presentationIds[0]),
    ).resolves.toMatchObject({ isLastAvailable: true });
    await expect(
      getEditablePresentation(bosqueVivoAdmin, productId, presentationIds[1]),
    ).resolves.toMatchObject({ isLastAvailable: false });
  });

  it("does not delete another association's presentations", async () => {
    const { productId, presentationIds } = await seedProductWith("DRAFT", [
      true,
    ]);

    await expect(
      deletePresentation(saboresAdmin, productId, presentationIds[0]),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    expect(await namesOf(productId)).toHaveLength(1);
  });
});

describe("movePresentation", () => {
  it("swaps a presentation with its neighbor", async () => {
    const { productId, presentationIds } = await seedProductWith("DRAFT", [
      true,
      true,
      true,
    ]);

    await movePresentation(
      bosqueVivoAdmin,
      productId,
      presentationIds[2],
      "up",
    );
    expect(await namesOf(productId)).toEqual([
      "Presentación 1",
      "Presentación 3",
      "Presentación 2",
    ]);

    await movePresentation(
      bosqueVivoAdmin,
      productId,
      presentationIds[0],
      "down",
    );
    expect(await namesOf(productId)).toEqual([
      "Presentación 3",
      "Presentación 1",
      "Presentación 2",
    ]);
    expect(
      (await getProductPresentations(productId)).map(
        ({ displayOrder }) => displayOrder,
      ),
    ).toEqual([0, 1, 2]);
  });

  it("leaves the order unchanged at the edges", async () => {
    const { productId, presentationIds } = await seedProductWith("DRAFT", [
      true,
      true,
    ]);

    await expect(
      movePresentation(bosqueVivoAdmin, productId, presentationIds[0], "up"),
    ).resolves.toEqual({ ok: true });
    expect(await namesOf(productId)).toEqual([
      "Presentación 1",
      "Presentación 2",
    ]);
  });

  it("does not reorder another association's presentations", async () => {
    const { productId, presentationIds } = await seedProductWith("DRAFT", [
      true,
      true,
    ]);

    await expect(
      movePresentation(saboresAdmin, productId, presentationIds[1], "up"),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
  });
});
