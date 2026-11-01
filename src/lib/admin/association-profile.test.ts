import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { associationsTable } from "@/db/schema/associations";
import {
  getAssociationProfile,
  removeAssociationImage,
  setAssociationImage,
  updateAssociationProfile,
} from "@/lib/admin/association-profile";
import { parseAssociationProfile } from "@/lib/admin/association-profile-form";
import { getPublicAssociation } from "@/lib/catalog/queries";
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

const { bosqueVivo, inactive } = ids.associations;
const webp = () =>
  new Uint8Array(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 x"));

function testDatabase() {
  return database.current as TestDatabase;
}

async function stored(associationId: string) {
  const [association] = await testDatabase()
    .db.select()
    .from(associationsTable)
    .where(eq(associationsTable.id, associationId));
  return association;
}

function input(overrides: Record<string, string> = {}) {
  const parsed = parseAssociationProfile({
    name: "Asociación Bosque Vivo",
    location: "La Macarena",
    description: "Mujeres que cultivan café.",
    history: "",
    contactName: "María Pérez",
    whatsappNumber: "",
    ...overrides,
  });

  if (!parsed.success) {
    throw new Error(JSON.stringify(parsed.fieldErrors));
  }

  return parsed.data;
}

beforeAll(async () => {
  const created = await createTestDatabase();
  database.current = created;
  await seedCatalog(created);
  await seedAdminProfiles(created);
});

beforeEach(async () => {
  storage.objects.clear();
  storage.failNext = false;
  storage.duringNextPut = undefined;
  await testDatabase()
    .db.update(associationsTable)
    .set({
      name: "Asociación Bosque Vivo",
      logoObjectKey: null,
      coverObjectKey: null,
    })
    .where(eq(associationsTable.id, bosqueVivo));
});

describe("parseAssociationProfile", () => {
  it("normalizes WhatsApp numbers like the public contact links", () => {
    expect(input({ whatsappNumber: "300 111 2233" }).whatsappNumber).toBe(
      "573001112233",
    );
    expect(input({ whatsappNumber: "+57 (300) 111-2233" }).whatsappNumber).toBe(
      "573001112233",
    );
    expect(input().whatsappNumber).toBeNull();
  });

  it("rejects numbers that cannot open a chat", () => {
    expect(
      parseAssociationProfile({ name: "A", whatsappNumber: "12345" }),
    ).toMatchObject({
      success: false,
      fieldErrors: { whatsappNumber: expect.any(String) },
    });
  });
});

describe("getAssociationProfile", () => {
  it("lets a super administrator open any association and admins their own", async () => {
    await expect(
      getAssociationProfile(superAdmin, inactive),
    ).resolves.toMatchObject({ slug: "asociacion-inactiva" });
    await expect(
      getAssociationProfile(bosqueVivoAdmin, bosqueVivo),
    ).resolves.toMatchObject({ slug: "bosque-vivo" });
    await expect(
      getAssociationProfile(saboresAdmin, bosqueVivo),
    ).resolves.toBeNull();
  });
});

describe("updateAssociationProfile", () => {
  it("saves the public profile, shown on the public page", async () => {
    await expect(
      updateAssociationProfile(
        bosqueVivoAdmin,
        bosqueVivo,
        input({ history: "Nació en 2009.", whatsappNumber: "3001112233" }),
      ),
    ).resolves.toEqual({ ok: true });

    await expect(getPublicAssociation("bosque-vivo")).resolves.toMatchObject({
      location: "La Macarena",
      description: "Mujeres que cultivan café.",
      history: "Nació en 2009.",
      whatsappNumber: "573001112233",
    });
    expect((await stored(bosqueVivo)).contactName).toBe("María Pérez");
  });

  it("keeps the name when an association administrator sends another", async () => {
    await updateAssociationProfile(
      bosqueVivoAdmin,
      bosqueVivo,
      input({ name: "Otro nombre" }),
    );

    expect((await stored(bosqueVivo)).name).toBe("Asociación Bosque Vivo");
  });

  it("keeps a rename committed while an association administrator saves", async () => {
    // A super administrator renames right before the administrator's write.
    const { db } = testDatabase();
    const update = db.update.bind(db);
    vi.spyOn(db, "update").mockImplementationOnce(
      (table) =>
        ({
          set: (values: Record<string, unknown>) => ({
            where: async (condition: unknown) => {
              await update(associationsTable)
                .set({ name: "Bosque Vivo del Guayabero" })
                .where(eq(associationsTable.id, bosqueVivo));
              return update(table)
                .set(values)
                .where(condition as never);
            },
          }),
        }) as unknown as ReturnType<typeof db.update>,
    );

    await expect(
      updateAssociationProfile(bosqueVivoAdmin, bosqueVivo, input()),
    ).resolves.toEqual({ ok: true });
    expect((await stored(bosqueVivo)).name).toBe("Bosque Vivo del Guayabero");
  });

  it("lets a super administrator rename without changing the slug", async () => {
    await updateAssociationProfile(
      superAdmin,
      bosqueVivo,
      input({ name: "Bosque Vivo del Guayabero" }),
    );

    expect(await stored(bosqueVivo)).toMatchObject({
      name: "Bosque Vivo del Guayabero",
      slug: "bosque-vivo",
    });
  });

  it("rejects another association's name, ignoring case", async () => {
    await expect(
      updateAssociationProfile(
        superAdmin,
        bosqueVivo,
        input({ name: "ASOCIACIÓN SABORES DE LA MACARENA" }),
      ),
    ).resolves.toMatchObject({
      ok: false,
      reason: "INVALID",
      fieldErrors: { name: expect.any(String) },
    });
  });

  it("rejects a duplicate name the earlier check missed", async () => {
    // Simulates a concurrent rename that commits right after the check.
    const { db } = testDatabase();
    const select = db.select.bind(db);
    vi.spyOn(db, "select")
      .mockImplementationOnce(select)
      .mockImplementationOnce(
        () =>
          ({
            from: () => ({ where: () => ({ limit: async () => [] }) }),
          }) as unknown as ReturnType<typeof db.select>,
      );

    await expect(
      updateAssociationProfile(
        superAdmin,
        bosqueVivo,
        input({ name: "asociación sabores de la macarena" }),
      ),
    ).resolves.toMatchObject({ ok: false, reason: "INVALID" });
  });

  it("lets a super administrator edit an inactive association", async () => {
    await expect(
      updateAssociationProfile(
        superAdmin,
        inactive,
        input({ name: "Asociación Inactiva", description: "En pausa." }),
      ),
    ).resolves.toEqual({ ok: true });
  });

  it("does not let an administrator edit another association", async () => {
    await expect(
      updateAssociationProfile(saboresAdmin, bosqueVivo, input()),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
  });
});

describe("association images", () => {
  it("stores a logo as an object key under the association", async () => {
    await expect(
      setAssociationImage(bosqueVivoAdmin, bosqueVivo, "logo", webp()),
    ).resolves.toEqual({ ok: true });

    const { logoObjectKey } = await stored(bosqueVivo);
    expect(logoObjectKey).toMatch(
      new RegExp(`^associations/${bosqueVivo}/logo-.+\\.webp$`),
    );
    expect(storage.objects.has(logoObjectKey!)).toBe(true);
  });

  it("replaces a cover and deletes the previous object", async () => {
    await setAssociationImage(superAdmin, bosqueVivo, "cover", webp());
    const first = (await stored(bosqueVivo)).coverObjectKey!;

    await setAssociationImage(superAdmin, bosqueVivo, "cover", webp());
    const second = (await stored(bosqueVivo)).coverObjectKey!;

    expect(second).not.toBe(first);
    expect([...storage.objects.keys()]).toEqual([second]);
  });

  it("rejects files that are not images before uploading", async () => {
    await expect(
      setAssociationImage(
        bosqueVivoAdmin,
        bosqueVivo,
        "logo",
        new Uint8Array(new TextEncoder().encode("GIF89a")),
      ),
    ).resolves.toMatchObject({ ok: false, reason: "INVALID_FILE" });
    expect(storage.objects.size).toBe(0);
  });

  it("changes nothing when the upload fails", async () => {
    storage.failNext = true;

    await expect(
      setAssociationImage(bosqueVivoAdmin, bosqueVivo, "logo", webp()),
    ).resolves.toEqual({ ok: false, reason: "STORAGE_ERROR" });
    expect((await stored(bosqueVivo)).logoObjectKey).toBeNull();
  });

  it("deletes its upload when the image changed meanwhile", async () => {
    storage.duringNextPut = () =>
      testDatabase()
        .db.update(associationsTable)
        .set({ logoObjectKey: "associations/otra-subida.webp" })
        .where(eq(associationsTable.id, bosqueVivo));

    await expect(
      setAssociationImage(bosqueVivoAdmin, bosqueVivo, "logo", webp()),
    ).resolves.toEqual({ ok: false, reason: "CONFLICT" });
    expect(storage.objects.size).toBe(0);
    expect((await stored(bosqueVivo)).logoObjectKey).toBe(
      "associations/otra-subida.webp",
    );
  });

  it("removes an image from storage and the profile", async () => {
    await setAssociationImage(bosqueVivoAdmin, bosqueVivo, "logo", webp());

    await expect(
      removeAssociationImage(bosqueVivoAdmin, bosqueVivo, "logo"),
    ).resolves.toEqual({ ok: true });
    expect(storage.objects.size).toBe(0);
    expect((await stored(bosqueVivo)).logoObjectKey).toBeNull();
  });

  it("keeps the image when storage cannot delete it", async () => {
    await setAssociationImage(bosqueVivoAdmin, bosqueVivo, "logo", webp());
    storage.failNext = true;

    await expect(
      removeAssociationImage(bosqueVivoAdmin, bosqueVivo, "logo"),
    ).resolves.toEqual({ ok: false, reason: "STORAGE_ERROR" });
    expect((await stored(bosqueVivo)).logoObjectKey).not.toBeNull();
  });

  it("does not let an administrator change another association's images", async () => {
    await expect(
      setAssociationImage(saboresAdmin, bosqueVivo, "logo", webp()),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    await expect(
      removeAssociationImage(saboresAdmin, bosqueVivo, "cover"),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    expect(storage.objects.size).toBe(0);
  });
});
