import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { productImagesTable } from "@/db/schema/productImages";
import { productsTable } from "@/db/schema/products";
import {
  deleteProductImage,
  getProductImages,
  moveProductImage,
  setPrimaryImage,
  updateImageAltText,
  uploadProductImage,
} from "@/lib/admin/product-image-mutations";
import { MAX_IMAGES_PER_PRODUCT } from "@/lib/storage/product-images";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import {
  bosqueVivoAdmin,
  ids,
  saboresAdmin,
  seedAdminProfiles,
  seedCatalog,
  seedProducts,
} from "@/test/fixtures";

const database = vi.hoisted(() => ({ current: undefined as unknown }));
const storage = vi.hoisted(() => ({
  objects: new Map<string, string>(),
  failNext: false,
}));
const lock = vi.hoisted(() => ({ failNext: false }));

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
        storage.objects.set(key, contentType);
      },
      async delete(key: string) {
        fail();
        storage.objects.delete(key);
      },
    }),
  };
});

vi.mock("@/lib/admin/product-lock", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/admin/product-lock")>();

  return {
    withProductLock: ((...args: Parameters<typeof actual.withProductLock>) => {
      if (lock.failNext) {
        lock.failNext = false;
        return Promise.reject(new Error("database unavailable"));
      }
      return actual.withProductLock(...args);
    }) as typeof actual.withProductLock,
  };
});

const webp = new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 imagen");
const gif = new TextEncoder().encode("GIF89a imagen");

function testDatabase() {
  return database.current as TestDatabase;
}

async function seedProduct() {
  const [{ id }] = await seedProducts(testDatabase(), [
    {
      slug: `cafe-${crypto.randomUUID()}`,
      associationId: ids.associations.bosqueVivo,
      status: "DRAFT",
    },
  ]);
  return id;
}

async function upload(productId: string, altText = "") {
  return uploadProductImage(bosqueVivoAdmin, productId, {
    bytes: new Uint8Array(webp),
    altText,
  });
}

async function productWithImages(total: number) {
  const productId = await seedProduct();
  for (let index = 0; index < total; index++) {
    await upload(productId, `Foto ${index + 1}`);
  }
  return { productId, images: await getProductImages(productId) };
}

beforeAll(async () => {
  const created = await createTestDatabase();
  database.current = created;
  await seedCatalog(created);
  await seedAdminProfiles(created);
});

beforeEach(async () => {
  await testDatabase().db.delete(productsTable);
  storage.objects.clear();
  storage.failNext = false;
  lock.failNext = false;
});

describe("uploadProductImage", () => {
  it("stores the object and records its key, making the first one primary", async () => {
    const { productId, images } = await productWithImages(2);

    expect(images).toMatchObject([
      { altText: "Foto 1", isPrimary: true, displayOrder: 0 },
      { altText: "Foto 2", isPrimary: false, displayOrder: 1 },
    ]);
    for (const { objectKey } of images) {
      expect(objectKey).toMatch(
        new RegExp(`^products/${productId}/.+\\.webp$`),
      );
      expect(storage.objects.get(objectKey)).toBe("image/webp");
    }

    const [product] = await testDatabase()
      .db.select()
      .from(productsTable)
      .where(eq(productsTable.id, productId));
    expect(product.updatedBy).toBe(bosqueVivoAdmin.id);
  });

  it("rejects files that are not JPEG, PNG or WebP before uploading", async () => {
    const productId = await seedProduct();

    await expect(
      uploadProductImage(bosqueVivoAdmin, productId, {
        bytes: new Uint8Array(gif),
        altText: "",
      }),
    ).resolves.toMatchObject({
      ok: false,
      reason: "INVALID",
      fieldErrors: { file: expect.any(String) },
    });
    expect(storage.objects.size).toBe(0);
  });

  it("rejects alt text over the column limit", async () => {
    const productId = await seedProduct();

    await expect(upload(productId, "a".repeat(301))).resolves.toMatchObject({
      ok: false,
      fieldErrors: { altText: expect.any(String) },
    });
  });

  it(`stops at ${MAX_IMAGES_PER_PRODUCT} images per product`, async () => {
    const { productId } = await productWithImages(MAX_IMAGES_PER_PRODUCT);

    await expect(upload(productId)).resolves.toEqual({
      ok: false,
      reason: "LIMIT_REACHED",
    });
    expect(storage.objects.size).toBe(MAX_IMAGES_PER_PRODUCT);
  });

  it("records nothing when the upload fails", async () => {
    const productId = await seedProduct();
    storage.failNext = true;

    await expect(upload(productId)).resolves.toEqual({
      ok: false,
      reason: "STORAGE_ERROR",
    });
    expect(await getProductImages(productId)).toEqual([]);
  });

  it("deletes the uploaded object when recording it fails", async () => {
    const productId = await seedProduct();
    lock.failNext = true;

    await expect(upload(productId)).rejects.toThrow("database unavailable");
    expect(storage.objects.size).toBe(0);
    expect(await getProductImages(productId)).toEqual([]);
  });

  it("does not upload for another association's product", async () => {
    const productId = await seedProduct();

    await expect(
      uploadProductImage(saboresAdmin, productId, {
        bytes: new Uint8Array(webp),
        altText: "",
      }),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    expect(storage.objects.size).toBe(0);
  });
});

describe("setPrimaryImage", () => {
  it("moves the primary mark to the chosen image", async () => {
    const { productId, images } = await productWithImages(3);

    await expect(
      setPrimaryImage(bosqueVivoAdmin, productId, images[2].id),
    ).resolves.toEqual({ ok: true });

    expect(
      (await getProductImages(productId)).map(({ isPrimary }) => isPrimary),
    ).toEqual([false, false, true]);
  });
});

describe("deleteProductImage", () => {
  it("removes the object and the record", async () => {
    const { productId, images } = await productWithImages(2);

    await deleteProductImage(bosqueVivoAdmin, productId, images[1].id);

    expect(storage.objects.has(images[1].objectKey)).toBe(false);
    expect((await getProductImages(productId)).map(({ id }) => id)).toEqual([
      images[0].id,
    ]);
  });

  it("promotes the next image when the primary one is removed", async () => {
    const { productId, images } = await productWithImages(3);

    await deleteProductImage(bosqueVivoAdmin, productId, images[0].id);

    expect(await getProductImages(productId)).toMatchObject([
      { id: images[1].id, isPrimary: true },
      { id: images[2].id, isPrimary: false },
    ]);
  });

  it("keeps the record when storage cannot delete the object", async () => {
    const { productId, images } = await productWithImages(1);
    storage.failNext = true;

    await expect(
      deleteProductImage(bosqueVivoAdmin, productId, images[0].id),
    ).resolves.toEqual({ ok: false, reason: "STORAGE_ERROR" });
    expect(await getProductImages(productId)).toHaveLength(1);
    expect(storage.objects.has(images[0].objectKey)).toBe(true);
  });

  it("does not delete another association's images", async () => {
    const { productId, images } = await productWithImages(1);

    await expect(
      deleteProductImage(saboresAdmin, productId, images[0].id),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    expect(storage.objects.size).toBe(1);
  });
});

describe("image details and order", () => {
  it("updates the alt text, clearing it when empty", async () => {
    const { productId, images } = await productWithImages(1);

    await updateImageAltText(
      bosqueVivoAdmin,
      productId,
      images[0].id,
      "  Bolsa de café sobre una mesa de madera ",
    );
    expect((await getProductImages(productId))[0].altText).toBe(
      "Bolsa de café sobre una mesa de madera",
    );

    await updateImageAltText(bosqueVivoAdmin, productId, images[0].id, " ");
    expect((await getProductImages(productId))[0].altText).toBeNull();
  });

  it("reorders images without changing the primary one", async () => {
    const { productId, images } = await productWithImages(3);

    await moveProductImage(bosqueVivoAdmin, productId, images[2].id, "up");

    expect(await getProductImages(productId)).toMatchObject([
      { id: images[0].id, isPrimary: true, displayOrder: 0 },
      { id: images[2].id, displayOrder: 1 },
      { id: images[1].id, displayOrder: 2 },
    ]);
  });

  it("respects the unique primary index", async () => {
    const { images } = await productWithImages(2);

    await expect(
      testDatabase()
        .db.update(productImagesTable)
        .set({ isPrimary: true })
        .where(eq(productImagesTable.id, images[1].id)),
    ).rejects.toThrow();
  });
});
