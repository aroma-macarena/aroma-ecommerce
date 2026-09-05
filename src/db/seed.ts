import { reset } from "drizzle-seed";
import { db } from "./index";
import { associationsTable as associations } from "./schema/associations";
import { categoriesTable as categories } from "./schema/categories";
import { productImagesTable as productImages } from "./schema/productImages";
import { productPresentationsTable as productPresentations } from "./schema/productPresentations";
import { productsTable as products } from "./schema/products";
import { profilesTable as profiles } from "./schema/profiles";
import { siteContentTable as siteContent } from "./schema/siteContent";

const tables = {
  associations,
  categories,
  productImages,
  productPresentations,
  products,
  profiles,
  siteContent,
};

const ids = {
  associations: {
    bosqueVivo: "11111111-1111-4111-8111-111111111111",
    saboresMacarena: "11111111-1111-4111-8111-222222222222",
  },

  profiles: {
    superAdmin: "22222222-2222-4222-8222-111111111111",
    bosqueVivoAdmin: "22222222-2222-4222-8222-222222222222",
    saboresMacarenaAdmin: "22222222-2222-4222-8222-333333333333",
  },

  categories: {
    coffee: "33333333-3333-4333-8333-111111111111",
    preserves: "33333333-3333-4333-8333-222222222222",
    crafts: "33333333-3333-4333-8333-333333333333",
  },

  products: {
    draftCoffee: "44444444-4444-4444-8444-111111111111",
    publishedCoffee: "44444444-4444-4444-8444-222222222222",
    pausedJam: "44444444-4444-4444-8444-333333333333",
  },

  presentations: {
    draftCoffee: "55555555-5555-4555-8555-111111111111",
    coffee250g: "55555555-5555-4555-8555-222222222222",
    coffee500g: "55555555-5555-4555-8555-333333333333",
    jam250g: "55555555-5555-4555-8555-444444444444",
  },

  images: {
    coffeePrimary: "66666666-6666-4666-8666-111111111111",
    coffeeSecondary: "66666666-6666-4666-8666-222222222222",
  },

  siteContent: {
    homeIntro: "77777777-7777-4777-8777-111111111111",
    aboutAroma: "77777777-7777-4777-8777-222222222222",
  },
} as const;

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Database seeding is not allowed in production.");
  }

  if (process.env.ALLOW_DB_SEED !== "true") {
    throw new Error(
      "Database seeding is disabled. Set ALLOW_DB_SEED=true in .env.local.",
    );
  }

  console.log("Resetting development database...");
  await reset(db, tables);

  console.log("Creating associations...");
  await db.insert(associations).values([
    {
      id: ids.associations.bosqueVivo,
      name: "Asociación Bosque Vivo",
      slug: "bosque-vivo",
      description:
        "Asociación ficticia utilizada para desarrollo y pruebas de la plataforma.",
      history:
        "Contenido provisional para representar la historia de una asociación.",
      location: "La Macarena, Meta",
      contactName: "María Pérez",
      whatsappNumber: "573001111111",
      status: "ACTIVE",
    },
    {
      id: ids.associations.saboresMacarena,
      name: "Asociación Sabores de La Macarena",
      slug: "sabores-macarena",
      description:
        "Asociación ficticia utilizada para probar separación y ownership de datos.",
      location: "La Macarena, Meta",
      contactName: "Ana Gómez",
      whatsappNumber: "573002222222",
      status: "ACTIVE",
    },
  ]);

  console.log("Creating categories...");
  await db.insert(categories).values([
    {
      id: ids.categories.coffee,
      name: "Café",
      slug: "cafe",
      description: "Productos relacionados con café.",
      isActive: true,
    },
    {
      id: ids.categories.preserves,
      name: "Conservas",
      slug: "conservas",
      description: "Productos transformados y conservas artesanales.",
      isActive: true,
    },
    {
      id: ids.categories.crafts,
      name: "Artesanías",
      slug: "artesanias",
      description: "Productos artesanales elaborados por las asociaciones.",
      isActive: true,
    },
  ]);

  console.log("Creating profiles...");
  await db.insert(profiles).values([
    {
      id: ids.profiles.superAdmin,
      authUserId: "seed_super_admin",
      associationId: null,
      name: "Super Admin",
      email: "superadmin@aroma.test",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
    {
      id: ids.profiles.bosqueVivoAdmin,
      authUserId: "seed_bosque_vivo_admin",
      associationId: ids.associations.bosqueVivo,
      name: "Admin Bosque Vivo",
      email: "bosque.vivo@aroma.test",
      role: "ASSOCIATION_ADMIN",
      status: "ACTIVE",
    },
    {
      id: ids.profiles.saboresMacarenaAdmin,
      authUserId: "seed_sabores_macarena_admin",
      associationId: ids.associations.saboresMacarena,
      name: "Admin Sabores de La Macarena",
      email: "sabores.macarena@aroma.test",
      role: "ASSOCIATION_ADMIN",
      status: "ACTIVE",
    },
  ]);

  console.log("Creating products...");
  await db.insert(products).values([
    {
      id: ids.products.draftCoffee,
      associationId: ids.associations.bosqueVivo,
      categoryId: ids.categories.coffee,
      name: "Café en preparación",
      slug: "cafe-en-preparacion",
      shortDescription:
        "Producto ficticio utilizado para probar el estado borrador.",
      description:
        "Este producto representa un registro que todavía no ha sido publicado.",
      origin: "La Macarena, Meta",
      status: "DRAFT",
      createdBy: ids.profiles.bosqueVivoAdmin,
      updatedBy: ids.profiles.bosqueVivoAdmin,
    },
    {
      id: ids.products.publishedCoffee,
      associationId: ids.associations.bosqueVivo,
      categoryId: ids.categories.coffee,
      name: "Café artesanal",
      slug: "cafe-artesanal",
      shortDescription:
        "Café ficticio utilizado como producto publicado de referencia.",
      description:
        "Producto provisional para desarrollar y probar el catálogo público.",
      origin: "La Macarena, Meta",
      ingredients: "Café 100 %",
      status: "PUBLISHED",
      createdBy: ids.profiles.bosqueVivoAdmin,
      updatedBy: ids.profiles.bosqueVivoAdmin,
      publishedAt: new Date("2026-01-15T15:00:00Z"),
    },
    {
      id: ids.products.pausedJam,
      associationId: ids.associations.saboresMacarena,
      categoryId: ids.categories.preserves,
      name: "Mermelada artesanal",
      slug: "mermelada-artesanal",
      shortDescription:
        "Producto ficticio utilizado para probar el estado pausado.",
      description:
        "Producto previamente publicado y actualmente no disponible en el catálogo.",
      origin: "La Macarena, Meta",
      availabilityNote: "Temporalmente no disponible",
      status: "PAUSED",
      createdBy: ids.profiles.saboresMacarenaAdmin,
      updatedBy: ids.profiles.saboresMacarenaAdmin,
      publishedAt: new Date("2026-01-10T15:00:00Z"),
    },
  ]);

  console.log("Creating product presentations...");
  await db.insert(productPresentations).values([
    {
      id: ids.presentations.draftCoffee,
      productId: ids.products.draftCoffee,
      name: "Presentación por definir",
      isAvailable: false,
      displayOrder: 0,
    },
    {
      id: ids.presentations.coffee250g,
      productId: ids.products.publishedCoffee,
      name: "Bolsa 250 g",
      quantity: "250",
      unit: "g",
      referencePrice: "25000",
      isAvailable: true,
      displayOrder: 0,
    },
    {
      id: ids.presentations.coffee500g,
      productId: ids.products.publishedCoffee,
      name: "Bolsa 500 g",
      quantity: "500",
      unit: "g",
      referencePrice: "45000",
      isAvailable: true,
      displayOrder: 1,
    },
    {
      id: ids.presentations.jam250g,
      productId: ids.products.pausedJam,
      name: "Frasco 250 g",
      quantity: "250",
      unit: "g",
      referencePrice: "18000",
      isAvailable: false,
      displayOrder: 0,
    },
  ]);

  console.log("Creating product images...");
  await db.insert(productImages).values([
    {
      id: ids.images.coffeePrimary,
      productId: ids.products.publishedCoffee,
      objectKey: "seed/products/cafe-artesanal/primary.webp",
      altText: "Café artesanal - imagen principal de prueba",
      displayOrder: 0,
      isPrimary: true,
    },
    {
      id: ids.images.coffeeSecondary,
      productId: ids.products.publishedCoffee,
      objectKey: "seed/products/cafe-artesanal/secondary.webp",
      altText: "Café artesanal - imagen secundaria de prueba",
      displayOrder: 1,
      isPrimary: false,
    },
  ]);

  console.log("Creating institutional content...");
  await db.insert(siteContent).values([
    {
      id: ids.siteContent.homeIntro,
      key: "home_intro",
      title: "Alianza AROMA",
      content:
        "Contenido institucional ficticio utilizado durante el desarrollo de la página principal.",
      updatedBy: ids.profiles.superAdmin,
    },
    {
      id: ids.siteContent.aboutAroma,
      key: "about_aroma",
      title: "Sobre AROMA",
      content:
        "Texto provisional utilizado para desarrollar y probar las secciones institucionales de la plataforma.",
      updatedBy: ids.profiles.superAdmin,
    },
  ]);

  console.log("Development database seeded successfully.");
}

main().catch((error) => {
  console.error("Failed to seed development database:");
  console.error(error);
  process.exit(1);
});
