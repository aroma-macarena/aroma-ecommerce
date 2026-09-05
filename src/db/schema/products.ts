import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { associationsTable as associations } from "./associations";
import { categoriesTable as categories } from "./categories";
import { profilesTable as profiles } from "./profiles";
import { productStatus } from "./enums";

export const productsTable = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().notNull(),
    associationId: uuid("association_id")
      .notNull()
      .references(() => associations.id, { onDelete: "restrict" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    shortDescription: varchar("short_description", { length: 500 }),
    description: text("description"),
    origin: varchar("origin", { length: 255 }),
    ingredients: text("ingredients"),
    availabilityNote: varchar("availability_note", { length: 500 }),
    status: productStatus("status").default("DRAFT").notNull(),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    updatedBy: uuid("updated_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("uq_products_association_slug").on(
      table.associationId,
      table.slug,
    ),
  ],
);
