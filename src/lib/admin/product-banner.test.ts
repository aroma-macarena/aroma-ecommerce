import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { productsTable } from "@/db/schema/products";
import {
  removeProductBanner,
  setProductBanner,
} from "@/lib/admin/product-banner";
import { getPublicProduct } from "@/lib/catalog/queries";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import {
  bosqueVivoAdmin,
  ids,
  saboresAdmin,
  seedAdminProfiles,
  seedCatalog,
  seedProducts,
  superAdmin,
} from "@/test/fixtures";

const database = vi.hoisted(() => ({ current: undefined as unknown }));
const storage = vi.hoisted(() => ({
  objects: new Map<string, string>(),
  failNext: false,
  // Runs during the next upload, like a request that commits meanwhile.
  duringNextPut: undefined as (() => Promise<unknown>) | undefined,
}));

vi.mock("@/db", () => ({
  get db() {
    return (database.current as TestDatabase).db;
  },
}));

vi.mock("@/lib/storage/r2", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/storage/r2")>();
  const fail = () => {
    if (storage.failNext) {
      storage.failNext = false;
      throw new actual.MediaStorageError("R2 unavailable");
    }
  };

  return {
    ...actual,
    getMediaStorage: () => ({
      async put(key: string, _body: Uint8Array, contentType: string) {
        fail();
        const during = storage.duringNextPut;
        storage.duringNextPut = undefined;
        await during?.();
        storage.objects.set(key, contentType);
      },
      async delete(key: string) {
        fail();
        storage.objects.delete(key);
      },
    }),
  };
});

const webp = () =>
  new Uint8Array(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 x"));

let productId: string;

function testDatabase() {
  return database.current as TestDatabase;
}

async function storedBanner() {
  const [product] = await testDatabase()
    .db.select({ bannerObjectKey: productsTable.bannerObjectKey })
    .from(productsTable)
    .where(eq(productsTable.id, productId));
  return product.bannerObjectKey;
}

beforeAll(async () => {
  const created = await createTestDatabase();
  database.current = created;
  await seedCatalog(created);
  await seedAdminProfiles(created);
  [{ id: productId }] = await seedProducts(created, [
    {
      slug: "cafe",
      associationId: ids.associations.bosqueVivo,
      status: "PUBLISHED",
      publishedAt: new Date("2026-01-01"),
    },
  ]);
});

beforeEach(async () => {
  storage.objects.clear();
  storage.failNext = false;
  storage.duringNextPut = undefined;
  await testDatabase()
    .db.update(productsTable)
    .set({ bannerObjectKey: null })
    .where(eq(productsTable.id, productId));
});

describe("product home banner", () => {
  it("stores the banner under the product and shows it publicly", async () => {
    await expect(
      setProductBanner(bosqueVivoAdmin, productId, webp()),
    ).resolves.toEqual({ ok: true });

    const key = await storedBanner();
    expect(key).toMatch(new RegExp(`^products/${productId}/banner-.+\\.webp$`));
    expect(storage.objects.has(key!)).toBe(true);
    await expect(
      getPublicProduct("bosque-vivo", "cafe"),
    ).resolves.toMatchObject({ bannerObjectKey: key });
  });

  it("replaces the banner and deletes the previous object", async () => {
    await setProductBanner(superAdmin, productId, webp());
    const first = await storedBanner();

    await setProductBanner(superAdmin, productId, webp());
    const second = await storedBanner();

    expect(second).not.toBe(first);
    expect([...storage.objects.keys()]).toEqual([second]);
  });

  it("rejects files that are not images before uploading", async () => {
    await expect(
      setProductBanner(
        bosqueVivoAdmin,
        productId,
        new Uint8Array(new TextEncoder().encode("GIF89a")),
      ),
    ).resolves.toMatchObject({ ok: false, reason: "INVALID_FILE" });
    expect(storage.objects.size).toBe(0);
  });

  it("changes nothing when the upload fails", async () => {
    storage.failNext = true;

    await expect(
      setProductBanner(bosqueVivoAdmin, productId, webp()),
    ).resolves.toEqual({ ok: false, reason: "STORAGE_ERROR" });
    expect(await storedBanner()).toBeNull();
  });

  it("deletes its upload when the banner changed meanwhile", async () => {
    storage.duringNextPut = () =>
      testDatabase()
        .db.update(productsTable)
        .set({ bannerObjectKey: "products/otra-subida.webp" })
        .where(eq(productsTable.id, productId));

    await expect(
      setProductBanner(bosqueVivoAdmin, productId, webp()),
    ).resolves.toEqual({ ok: false, reason: "CONFLICT" });
    expect(storage.objects.size).toBe(0);
    expect(await storedBanner()).toBe("products/otra-subida.webp");
  });

  it("removes the banner from storage and the product", async () => {
    await setProductBanner(bosqueVivoAdmin, productId, webp());

    await expect(
      removeProductBanner(bosqueVivoAdmin, productId),
    ).resolves.toEqual({ ok: true });
    expect(storage.objects.size).toBe(0);
    expect(await storedBanner()).toBeNull();
  });

  it("keeps the banner when storage cannot delete it", async () => {
    await setProductBanner(bosqueVivoAdmin, productId, webp());
    storage.failNext = true;

    await expect(
      removeProductBanner(bosqueVivoAdmin, productId),
    ).resolves.toEqual({ ok: false, reason: "STORAGE_ERROR" });
    expect(await storedBanner()).not.toBeNull();
  });

  it("does not let another association's administrator change it", async () => {
    await expect(
      setProductBanner(saboresAdmin, productId, webp()),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    await expect(removeProductBanner(saboresAdmin, productId)).resolves.toEqual(
      { ok: false, reason: "NOT_FOUND" },
    );
    expect(storage.objects.size).toBe(0);
  });
});
