import { inArray } from "drizzle-orm";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { getAdminNavigation } from "@/components/admin/admin-navigation";
import { associationsTable } from "@/db/schema/associations";
import { productImagesTable } from "@/db/schema/productImages";
import { productsTable } from "@/db/schema/products";
import { profilesTable } from "@/db/schema/profiles";
import {
  getAllianceDashboard,
  getAssociationDashboard,
  getPendingTasks,
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
      counts: { published: 4, drafts: 4, paused: 1 },
      pendingInvitations: 2,
    });
  });

  it("is only for super administrators", async () => {
    await expect(getAllianceDashboard(bosqueVivoAdmin)).resolves.toBeNull();
  });
});

describe("getPendingTasks", () => {
  it("lists an association's drafts, its products' hidden problems and its profile gaps, each with its link", async () => {
    const tasks = await getPendingTasks(bosqueVivoAdmin);

    // Drafts first, with what blocks them or «Publicar» when ready.
    expect(tasks.filter(({ id }) => id.startsWith("borrador-"))).toHaveLength(
      3,
    );
    expect(tasks.find(({ action }) => action === "Publicar")).toBeDefined();
    // Published and paused products: one row each, every problem together.
    expect(
      tasks
        .filter(({ id }) => id.startsWith("producto-"))
        .map(({ subject, missing, action, href }) => ({
          subject,
          missing,
          action,
          href,
        })),
    ).toEqual(
      ["pausado", "publicado-1", "publicado-2"].map((name) => ({
        subject: name,
        missing: "Sin foto y sin descripción corta",
        action: "Revisar",
        href: expect.stringMatching(/^\/admin\/products\/[0-9a-f-]+$/),
      })),
    );
    expect(tasks.find(({ id }) => id.startsWith("perfil-"))).toEqual({
      id: `perfil-${bosqueVivo}`,
      subject: "Tu asociación",
      missing:
        "Sin descripción, sin zona en el mapa, sin portada y sin WhatsApp",
      action: "Completar",
      href: "/admin/association",
    });
    // Nothing from other associations, nothing only the alliance handles.
    expect(tasks.map(({ subject }) => subject)).not.toContain("de-otra");
    expect(
      tasks.some(({ id }) =>
        /^(invitacion|sin-cuenta|whatsapp-alianza)/.test(id),
      ),
    ).toBe(false);
  });

  it("lists the alliance's contact, invitations and the problems of what the storefront shows", async () => {
    const tasks = await getPendingTasks(superAdmin);

    // Without its own WhatsApp, the alliance's contact buttons are hidden.
    expect(tasks[0]).toMatchObject({
      id: "whatsapp-alianza",
      href: "/admin/content/alliance_whatsapp/edit",
    });
    expect(tasks.filter(({ id }) => id.startsWith("invitacion-"))).toHaveLength(
      2,
    );
    expect(tasks.some(({ id }) => id.startsWith("borrador-"))).toBe(false);
    // Both active associations have an administrator.
    expect(tasks.some(({ id }) => id.startsWith("sin-cuenta-"))).toBe(false);
    // Only published products of active associations: not the paused one,
    // not the inactive association's.
    expect(
      tasks
        .filter(({ id }) => id.startsWith("producto-"))
        .map(({ subject }) => subject),
    ).toEqual(["de-otra", "publicado-1", "publicado-2"]);
  });

  it("flags a hidden published product and an association nobody administers, and nothing complete", async () => {
    const { db } = database.current as TestDatabase;
    const unmanaged = "00000000-0000-4000-8000-000000000a09";
    await db.insert(associationsTable).values({
      id: unmanaged,
      name: "Asociación Sin Cuenta",
      slug: "sin-cuenta",
      description: "Productoras de la vereda.",
      zone: "el-billar",
      coverObjectKey: "associations/portada.webp",
      whatsappNumber: "573001112233",
    });
    const [hidden, complete] = await seedProducts(
      database.current as TestDatabase,
      [
        {
          slug: "oculto",
          associationId: unmanaged,
          status: "PUBLISHED",
          categoryId: ids.categories.inactivePreserves,
        },
        { slug: "completo", associationId: unmanaged, status: "PUBLISHED" },
      ],
    );
    await db
      .update(productsTable)
      .set({ shortDescription: "Una frase." })
      .where(inArray(productsTable.id, [hidden.id, complete.id]));
    await db.insert(productImagesTable).values(
      [hidden.id, complete.id].map((productId) => ({
        productId,
        objectKey: `products/${productId}.webp`,
      })),
    );

    const tasks = await getPendingTasks(superAdmin);

    expect(tasks).toContainEqual({
      id: `sin-cuenta-${unmanaged}`,
      subject: "Asociación Sin Cuenta",
      missing: "Nadie la administra en el panel",
      action: "Invitar",
      href: `/admin/users/new?asociacion=${unmanaged}`,
    });
    expect(tasks).toContainEqual({
      id: `producto-${hidden.id}`,
      subject: "oculto",
      missing: "No se ve: su categoría está inactiva",
      action: "Revisar",
      href: `/admin/products/${hidden.id}`,
    });
    // A complete product and a complete profile raise nothing.
    expect(tasks.map(({ id }) => id)).not.toContain(`producto-${complete.id}`);
    expect(tasks.map(({ id }) => id)).not.toContain(`perfil-${unmanaged}`);
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
