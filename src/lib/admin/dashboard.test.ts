import { beforeAll, describe, expect, it, vi } from "vitest";

import { getAdminNavigation } from "@/components/admin/admin-navigation";
import { profilesTable } from "@/db/schema/profiles";
import {
  getAllianceDashboard,
  getAssociationDashboard,
} from "@/lib/admin/dashboard";
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

const { bosqueVivo, sabores, inactive } = ids.associations;

beforeAll(async () => {
  const created = await createTestDatabase();
  database.current = created;
  await seedCatalog(created);
  await seedAdminProfiles(created);

  const [readyDraft] = await seedProducts(created, [
    { slug: "borrador-listo", associationId: bosqueVivo, status: "DRAFT" },
  ]);
  await seedProducts(created, [
    {
      slug: "borrador-sin-presentacion",
      associationId: bosqueVivo,
      status: "DRAFT",
    },
    {
      slug: "borrador-categoria-inactiva",
      associationId: bosqueVivo,
      status: "DRAFT",
      categoryId: ids.categories.inactivePreserves,
    },
    { slug: "publicado-1", associationId: bosqueVivo, status: "PUBLISHED" },
    { slug: "publicado-2", associationId: bosqueVivo, status: "PUBLISHED" },
    { slug: "pausado", associationId: bosqueVivo, status: "PAUSED" },
    { slug: "de-otra", associationId: sabores, status: "PUBLISHED" },
    { slug: "de-otra-borrador", associationId: sabores, status: "DRAFT" },
    { slug: "de-inactiva", associationId: inactive, status: "PUBLISHED" },
  ]);
  await seedPresentations(created, [
    { productId: readyDraft.id, name: "Bolsa 250 g", isAvailable: true },
  ]);

  await created.db.insert(profilesTable).values([
    {
      invitationId: "inv_1",
      name: "Pendiente",
      email: "pendiente@aroma.test",
      role: "SUPER_ADMIN",
    },
    {
      invitationId: "inv_2",
      name: "Otra pendiente",
      email: "otra@aroma.test",
      role: "ASSOCIATION_ADMIN",
      associationId: sabores,
    },
  ]);
});

describe("getAssociationDashboard", () => {
  it("counts only the association's own products by status", async () => {
    const dashboard = await getAssociationDashboard(bosqueVivoAdmin);

    expect(dashboard?.counts).toEqual({ published: 2, drafts: 3, paused: 1 });
  });

  it("lists each draft with what it is missing to be published", async () => {
    const dashboard = await getAssociationDashboard(bosqueVivoAdmin);
    const missing = Object.fromEntries(
      dashboard?.drafts.map(({ name, missing }) => [name, missing]) ?? [],
    );

    expect(missing).toEqual({
      "borrador-listo": [],
      "borrador-sin-presentacion": ["Le falta una presentación disponible"],
      "borrador-categoria-inactiva": [
        "Su categoría está inactiva",
        "Le falta una presentación disponible",
      ],
    });
  });

  it("returns the association's public state for its profile link", async () => {
    await expect(
      getAssociationDashboard(bosqueVivoAdmin),
    ).resolves.toMatchObject({
      association: { slug: "bosque-vivo", status: "ACTIVE" },
    });
  });

  it("never mixes in other associations", async () => {
    const dashboard = await getAssociationDashboard(saboresAdmin);

    expect(dashboard?.counts).toEqual({ published: 1, drafts: 1, paused: 0 });
    expect(dashboard?.drafts.map(({ name }) => name)).toEqual([
      "de-otra-borrador",
    ]);
  });

  it("is only for association administrators", async () => {
    await expect(getAssociationDashboard(superAdmin)).resolves.toBeNull();
  });
});

describe("getAllianceDashboard", () => {
  it("summarizes associations, published products and pending invitations", async () => {
    await expect(getAllianceDashboard(superAdmin)).resolves.toEqual({
      associations: { active: 2, total: 3 },
      publishedProducts: 4,
      pendingInvitations: 2,
    });
  });

  it("is only for super administrators", async () => {
    await expect(getAllianceDashboard(bosqueVivoAdmin)).resolves.toBeNull();
  });
});

describe("getAdminNavigation", () => {
  it("puts products first and users last for super administrators", () => {
    expect(getAdminNavigation("SUPER_ADMIN").map(({ label }) => label)).toEqual(
      [
        "Inicio",
        "Productos",
        "Asociaciones",
        "Categorías",
        "Contenido",
        "Usuarios",
      ],
    );
  });

  it("puts products before the association profile for association administrators", () => {
    expect(
      getAdminNavigation("ASSOCIATION_ADMIN").map(({ label }) => label),
    ).toEqual(["Inicio", "Productos", "Mi asociación"]);
  });
});
