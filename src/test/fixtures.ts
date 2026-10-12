import { associationsTable } from "@/db/schema/associations";
import { categoriesTable } from "@/db/schema/categories";
import { productsTable } from "@/db/schema/products";
import { profilesTable } from "@/db/schema/profiles";
import type { AdminProfile } from "@/lib/auth/get-current-profile";
import type { TestDatabase } from "@/test/database";

export const ids = {
  associations: {
    bosqueVivo: "00000000-0000-4000-8000-000000000a01",
    sabores: "00000000-0000-4000-8000-000000000a02",
    inactive: "00000000-0000-4000-8000-000000000a03",
  },
  categories: {
    coffee: "00000000-0000-4000-8000-000000000c01",
    inactivePreserves: "00000000-0000-4000-8000-000000000c02",
  },
} as const;

export const superAdmin: AdminProfile = {
  id: "00000000-0000-4000-8000-000000000b01",
  name: "Superadministrador",
  email: "super@aroma.test",
  role: "SUPER_ADMIN",
  associationId: null,
  associationName: null,
};

export const bosqueVivoAdmin: AdminProfile = {
  id: "00000000-0000-4000-8000-000000000b02",
  name: "Admin Bosque Vivo",
  email: "bosque@aroma.test",
  role: "ASSOCIATION_ADMIN",
  associationId: ids.associations.bosqueVivo,
  associationName: "Asociación Bosque Vivo",
};

export const saboresAdmin: AdminProfile = {
  id: "00000000-0000-4000-8000-000000000b03",
  name: "Admin Sabores",
  email: "sabores@aroma.test",
  role: "ASSOCIATION_ADMIN",
  associationId: ids.associations.sabores,
  associationName: "Asociación Sabores de La Macarena",
};

/** Associations and categories shared by every scenario. */
export async function seedCatalog({ db }: TestDatabase) {
  await db.insert(associationsTable).values([
    {
      id: ids.associations.bosqueVivo,
      name: "Asociación Bosque Vivo",
      slug: "bosque-vivo",
    },
    {
      id: ids.associations.sabores,
      name: "Asociación Sabores de La Macarena",
      slug: "sabores-macarena",
    },
    {
      id: ids.associations.inactive,
      name: "Asociación Inactiva",
      slug: "asociacion-inactiva",
      status: "INACTIVE",
    },
  ]);

  await db.insert(categoriesTable).values([
    { id: ids.categories.coffee, name: "Café", slug: "cafe" },
    {
      id: ids.categories.inactivePreserves,
      name: "Conservas",
      slug: "conservas",
      isActive: false,
    },
  ]);
}

type ProductSeed = {
  slug: string;
  associationId: string;
  status: "DRAFT" | "PUBLISHED" | "PAUSED";
  categoryId?: string;
};

export async function seedProducts(
  { db }: TestDatabase,
  products: ProductSeed[],
) {
  await db.insert(productsTable).values(
    products.map(({ slug, associationId, status, categoryId }) => ({
      name: slug,
      slug,
      associationId,
      status,
      categoryId: categoryId ?? ids.categories.coffee,
    })),
  );
}

export async function seedProfiles(
  { db }: TestDatabase,
  profiles: (typeof profilesTable.$inferInsert)[],
) {
  await db.insert(profilesTable).values(profiles);
}
