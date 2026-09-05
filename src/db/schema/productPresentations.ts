import {
  boolean,
  check,
  decimal,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { productsTable as products } from "./products";
import { sql } from "drizzle-orm";

export const productPresentationsTable = pgTable(
  "product_presentations",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 150 }).notNull(),
    quantity: decimal("quantity", { precision: 12, scale: 3 }),
    unit: varchar("unit", { length: 50 }),
    referencePrice: decimal("reference_price", { precision: 12, scale: 2 }),
    isAvailable: boolean("is_available").default(true).notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    check(
      "ck_products_quantity_positive",
      sql`${table.quantity} IS NULL OR ${table.quantity} > 0`,
    ),
    check(
      "ck_products_reference_price_non_negative",
      sql`${table.referencePrice} IS NULL OR ${table.referencePrice} >= 0`,
    ),
    check(
      "ck_products_display_order_non_negative",
      sql`${table.displayOrder} >= 0`,
    ),
  ],
);
