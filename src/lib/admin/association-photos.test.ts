import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { associationPhotosTable } from "@/db/schema/associationPhotos";
import {
  deleteAssociationPhoto,
  getAssociationPhotos,
  moveAssociationPhoto,
  updateAssociationPhoto,
  uploadAssociationPhoto,
} from "@/lib/admin/association-photos";
import { getPublicAssociation } from "@/lib/catalog/queries";
import { MAX_ASSOCIATION_PHOTOS } from "@/lib/storage/association-images";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import {
  bosqueVivoAdmin,
  ids,
  saboresAdmin,
  seedAdminProfiles,
  seedCatalog,
  superAdmin,
} from "@/test/fixtures";

const database = vi.hoisted(() => ({ current: undefined as unknown }));
const storage = vi.hoisted(() => ({
  objects: new Map<string, string>(),
  failNext: false,
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
        storage.objects.set(key, contentType);
      },
      async delete(key: string) {
        fail();
        storage.objects.delete(key);
      },
    }),
  };
});

const { bosqueVivo } = ids.associations;
const webp = () =>
  new Uint8Array(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 x"));
const upload = (overrides: { altText?: string; caption?: string } = {}) => ({
  bytes: webp(),
  altText: "",
  caption: "",
  ...overrides,
});

beforeAll(async () => {
  const created = await createTestDatabase();
  database.current = created;
  await seedCatalog(created);
  await seedAdminProfiles(created);
});

beforeEach(async () => {
  storage.objects.clear();
  storage.failNext = false;
  await (database.current as TestDatabase).db
    .delete(associationPhotosTable)
    .where(eq(associationPhotosTable.associationId, bosqueVivo));
});

describe("association photos", () => {
  it("stores a photo under the association, with its texts, and shows it publicly", async () => {
    await expect(
      uploadAssociationPhoto(
        bosqueVivoAdmin,
        bosqueVivo,
        upload({ altText: " Mujeres cosechando ", caption: "Cosecha" }),
      ),
    ).resolves.toEqual({ ok: true });

    const [photo] = await getAssociationPhotos(bosqueVivo);
    expect(photo).toMatchObject({
      altText: "Mujeres cosechando",
      caption: "Cosecha",
    });
    expect(photo.objectKey).toMatch(
      new RegExp(`^associations/${bosqueVivo}/photo-.+\\.webp$`),
    );
    expect(storage.objects.has(photo.objectKey)).toBe(true);
    await expect(getPublicAssociation("bosque-vivo")).resolves.toMatchObject({
      photos: [{ caption: "Cosecha", altText: "Mujeres cosechando" }],
    });
  });

  it("adds photos last and stops at the maximum", async () => {
    for (let i = 0; i < MAX_ASSOCIATION_PHOTOS; i += 1) {
      await uploadAssociationPhoto(
        superAdmin,
        bosqueVivo,
        upload({ caption: `Foto ${i + 1}` }),
      );
    }

    await expect(
      uploadAssociationPhoto(superAdmin, bosqueVivo, upload()),
    ).resolves.toEqual({ ok: false, reason: "LIMIT_REACHED" });
    expect(
      (await getAssociationPhotos(bosqueVivo)).map(({ caption }) => caption),
    ).toEqual(
      Array.from(
        { length: MAX_ASSOCIATION_PHOTOS },
        (_, index) => `Foto ${index + 1}`,
      ),
    );
    expect(storage.objects.size).toBe(MAX_ASSOCIATION_PHOTOS);
  });

  it("rejects files that are not images and texts that are too long", async () => {
    await expect(
      uploadAssociationPhoto(bosqueVivoAdmin, bosqueVivo, {
        ...upload({ caption: "x".repeat(161) }),
        bytes: new Uint8Array(new TextEncoder().encode("GIF89a")),
      }),
    ).resolves.toMatchObject({
      ok: false,
      reason: "INVALID",
      fieldErrors: { file: expect.any(String), caption: expect.any(String) },
    });
    expect(storage.objects.size).toBe(0);
  });

  it("changes nothing when the upload fails", async () => {
    storage.failNext = true;

    await expect(
      uploadAssociationPhoto(bosqueVivoAdmin, bosqueVivo, upload()),
    ).resolves.toEqual({ ok: false, reason: "STORAGE_ERROR" });
    await expect(getAssociationPhotos(bosqueVivo)).resolves.toEqual([]);
  });

  it("edits the texts and moves a photo", async () => {
    await uploadAssociationPhoto(
      superAdmin,
      bosqueVivo,
      upload({ caption: "A" }),
    );
    await uploadAssociationPhoto(
      superAdmin,
      bosqueVivo,
      upload({ caption: "B" }),
    );
    const [first, second] = await getAssociationPhotos(bosqueVivo);

    await expect(
      updateAssociationPhoto(bosqueVivoAdmin, bosqueVivo, second.id, {
        altText: "Secado de café",
        caption: "",
      }),
    ).resolves.toEqual({ ok: true });
    await expect(
      moveAssociationPhoto(bosqueVivoAdmin, bosqueVivo, second.id, "up"),
    ).resolves.toEqual({ ok: true });

    expect(await getAssociationPhotos(bosqueVivo)).toMatchObject([
      { id: second.id, altText: "Secado de café", caption: null },
      { id: first.id, caption: "A" },
    ]);
  });

  it("deletes a photo from storage and the profile, keeping it if storage fails", async () => {
    await uploadAssociationPhoto(bosqueVivoAdmin, bosqueVivo, upload());
    const [photo] = await getAssociationPhotos(bosqueVivo);

    storage.failNext = true;
    await expect(
      deleteAssociationPhoto(bosqueVivoAdmin, bosqueVivo, photo.id),
    ).resolves.toEqual({ ok: false, reason: "STORAGE_ERROR" });
    expect(await getAssociationPhotos(bosqueVivo)).toHaveLength(1);

    await expect(
      deleteAssociationPhoto(bosqueVivoAdmin, bosqueVivo, photo.id),
    ).resolves.toEqual({ ok: true });
    expect(await getAssociationPhotos(bosqueVivo)).toEqual([]);
    expect(storage.objects.size).toBe(0);
  });

  it("does not let another association's administrator change them", async () => {
    await uploadAssociationPhoto(bosqueVivoAdmin, bosqueVivo, upload());
    const [photo] = await getAssociationPhotos(bosqueVivo);
    const texts = { altText: "", caption: "" };

    await expect(
      uploadAssociationPhoto(saboresAdmin, bosqueVivo, upload()),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    await expect(
      updateAssociationPhoto(saboresAdmin, bosqueVivo, photo.id, texts),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    await expect(
      moveAssociationPhoto(saboresAdmin, bosqueVivo, photo.id, "down"),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    await expect(
      deleteAssociationPhoto(saboresAdmin, bosqueVivo, photo.id),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    expect(storage.objects.size).toBe(1);
  });
});
