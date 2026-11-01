import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { associationsTable } from "@/db/schema/associations";
import { productsTable } from "@/db/schema/products";
import {
  createAssociation,
  getAdminAssociations,
  getEditableAssociation,
  parseAssociationForm,
  setAssociationStatus,
  updateAssociation,
} from "@/lib/admin/associations";
import getCurrentProfile from "@/lib/auth/get-current-profile";
import {
  getCatalogProducts,
  getPublicAssociation,
} from "@/lib/catalog/queries";
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

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));

const { bosqueVivo, sabores } = ids.associations;

function testDatabase() {
  return database.current as TestDatabase;
}

async function statusOf(associationId: string) {
  const [association] = await testDatabase()
    .db.select({ status: associationsTable.status })
    .from(associationsTable)
    .where(eq(associationsTable.id, associationId));
  return association?.status;
}

beforeAll(async () => {
  const created = await createTestDatabase();
  database.current = created;
  await seedCatalog(created);
  await seedAdminProfiles(created);
  await seedProducts(created, [
    { slug: "cafe", associationId: bosqueVivo, status: "PUBLISHED" },
    { slug: "miel", associationId: bosqueVivo, status: "DRAFT" },
  ]);
});

beforeEach(async () => {
  await setAssociationStatus(superAdmin, bosqueVivo, "ACTIVE");
});

describe("parseAssociationForm", () => {
  it("requires a name and keeps the location optional", () => {
    expect(parseAssociationForm({ name: "  " })).toMatchObject({
      success: false,
      fieldErrors: { name: expect.any(String) },
    });
    expect(parseAssociationForm({ name: " ASCAGY ", location: "" })).toEqual({
      success: true,
      data: { name: "ASCAGY", location: null },
    });
  });
});

describe("getAdminAssociations", () => {
  it("lists every association with its products and admin accounts", async () => {
    const list = await getAdminAssociations(superAdmin);

    expect(list?.map(({ slug }) => slug)).toContain("asociacion-inactiva");
    expect(list?.find(({ id }) => id === bosqueVivo)).toMatchObject({
      status: "ACTIVE",
      productCount: 2,
      publishedCount: 1,
      adminCount: 1,
    });
  });

  it("is only for super administrators", async () => {
    await expect(getAdminAssociations(bosqueVivoAdmin)).resolves.toBeNull();
  });
});

describe("createAssociation", () => {
  it("creates an active association with a slug from its name", async () => {
    await expect(
      createAssociation(superAdmin, {
        name: "Las Guacamayas del Jordán",
        location: "Vereda El Jordán",
      }),
    ).resolves.toEqual({ ok: true, slug: "las-guacamayas-del-jordan" });

    const [created] = await testDatabase()
      .db.select()
      .from(associationsTable)
      .where(eq(associationsTable.slug, "las-guacamayas-del-jordan"));
    expect(created).toMatchObject({
      status: "ACTIVE",
      location: "Vereda El Jordán",
    });
  });

  it("adds a suffix when the slug is taken", async () => {
    await expect(
      createAssociation(superAdmin, {
        name: "Bosque  Vivo!",
        location: null,
      }),
    ).resolves.toEqual({ ok: true, slug: "bosque-vivo-2" });
  });

  it("rejects a name that already exists, ignoring case", async () => {
    await expect(
      createAssociation(superAdmin, {
        name: "asociación bosque vivo",
        location: null,
      }),
    ).resolves.toMatchObject({
      ok: false,
      reason: "INVALID",
      fieldErrors: { name: expect.any(String) },
    });
  });

  it("is only for super administrators", async () => {
    await expect(
      createAssociation(bosqueVivoAdmin, { name: "Nueva", location: null }),
    ).resolves.toEqual({ ok: false, reason: "FORBIDDEN" });
  });
});

describe("setAssociationStatus", () => {
  it("is only for super administrators", async () => {
    await expect(
      setAssociationStatus(bosqueVivoAdmin, bosqueVivo, "INACTIVE"),
    ).resolves.toEqual({ ok: false, reason: "FORBIDDEN" });
    expect(await statusOf(bosqueVivo)).toBe("ACTIVE");
  });

  it("reports unknown associations", async () => {
    await expect(
      setAssociationStatus(superAdmin, "not-a-uuid", "INACTIVE"),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    await expect(
      setAssociationStatus(
        superAdmin,
        "00000000-0000-4000-8000-00000000ffff",
        "INACTIVE",
      ),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
  });

  it("hides an association and blocks its admins without deleting anything", async () => {
    vi.mocked(auth).mockResolvedValue({
      isAuthenticated: true,
      userId: `user_${bosqueVivoAdmin.id}`,
    } as Awaited<ReturnType<typeof auth>>);

    await expect(
      setAssociationStatus(superAdmin, bosqueVivo, "INACTIVE"),
    ).resolves.toEqual({ ok: true, slug: "bosque-vivo" });

    await expect(getPublicAssociation("bosque-vivo")).resolves.toBeNull();
    await expect(
      getCatalogProducts({ associationSlug: "bosque-vivo" }),
    ).resolves.toEqual([]);
    await expect(getCurrentProfile()).resolves.toMatchObject({
      status: "ASSOCIATION_INACTIVE",
    });
    expect(
      await testDatabase()
        .db.select({ id: productsTable.id })
        .from(productsTable)
        .where(eq(productsTable.associationId, bosqueVivo)),
    ).toHaveLength(2);

    await setAssociationStatus(superAdmin, bosqueVivo, "ACTIVE");

    await expect(getPublicAssociation("bosque-vivo")).resolves.toMatchObject({
      products: [{ slug: "cafe" }],
    });
    await expect(getCurrentProfile()).resolves.toMatchObject({
      status: "ACTIVE",
    });
  });
});

describe("updateAssociation", () => {
  const original = { name: "Asociación Bosque Vivo", location: "La Macarena" };

  beforeEach(async () => {
    await updateAssociation(superAdmin, bosqueVivo, original);
  });

  it("renames an association without changing its public address", async () => {
    await expect(
      updateAssociation(superAdmin, bosqueVivo, {
        name: "Bosque Vivo del Guayabero",
        location: "Vereda Yarumales",
      }),
    ).resolves.toEqual({ ok: true, slug: "bosque-vivo" });

    await expect(getPublicAssociation("bosque-vivo")).resolves.toMatchObject({
      name: "Bosque Vivo del Guayabero",
      location: "Vereda Yarumales",
    });
  });

  it("keeps its own name but not another association's", async () => {
    await expect(
      updateAssociation(superAdmin, bosqueVivo, {
        ...original,
        location: "Otra vereda",
      }),
    ).resolves.toMatchObject({ ok: true });
    await expect(
      updateAssociation(superAdmin, bosqueVivo, {
        name: "ASOCIACIÓN SABORES DE LA MACARENA",
        location: null,
      }),
    ).resolves.toMatchObject({
      ok: false,
      reason: "INVALID",
      fieldErrors: { name: expect.any(String) },
    });
  });

  it("is only for super administrators", async () => {
    await expect(
      updateAssociation(bosqueVivoAdmin, bosqueVivo, {
        name: "Renombrada",
        location: null,
      }),
    ).resolves.toEqual({ ok: false, reason: "FORBIDDEN" });
    await expect(
      getEditableAssociation(bosqueVivoAdmin, bosqueVivo),
    ).resolves.toBeNull();
  });

  it("reports unknown associations", async () => {
    await expect(
      updateAssociation(superAdmin, "00000000-0000-4000-8000-00000000ffff", {
        name: "Nadie",
        location: null,
      }),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    await expect(
      getEditableAssociation(superAdmin, "no-es-un-id"),
    ).resolves.toBeNull();
  });

  it("loads an association for editing", async () => {
    await expect(
      getEditableAssociation(superAdmin, sabores),
    ).resolves.toMatchObject({
      name: "Asociación Sabores de La Macarena",
      slug: "sabores-macarena",
      status: "ACTIVE",
    });
  });
});

describe("name uniqueness in the database", () => {
  // Simulates a concurrent request: the duplicate check sees no conflict
  // because the other association commits right after it.
  function skipNextDuplicateCheck() {
    const { db } = testDatabase();
    vi.spyOn(db, "select").mockImplementationOnce(
      () =>
        ({
          from: () => ({ where: () => ({ limit: async () => [] }) }),
        }) as unknown as ReturnType<typeof db.select>,
    );
  }

  it("rejects a duplicate name the earlier check missed when creating", async () => {
    skipNextDuplicateCheck();

    await expect(
      createAssociation(superAdmin, {
        name: "ASOCIACIÓN SABORES DE LA MACARENA",
        location: null,
      }),
    ).resolves.toMatchObject({
      ok: false,
      reason: "INVALID",
      fieldErrors: { name: "Ya existe una asociación con ese nombre." },
    });
  });

  it("rejects a duplicate name the earlier check missed when renaming", async () => {
    skipNextDuplicateCheck();

    await expect(
      updateAssociation(superAdmin, bosqueVivo, {
        name: "asociación sabores de la macarena",
        location: null,
      }),
    ).resolves.toMatchObject({
      ok: false,
      reason: "INVALID",
      fieldErrors: { name: expect.any(String) },
    });
    await expect(getPublicAssociation("bosque-vivo")).resolves.toMatchObject({
      name: "Asociación Bosque Vivo",
    });
  });
});
