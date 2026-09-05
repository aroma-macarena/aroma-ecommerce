import {
  boolean,
  check,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { productsTable as products } from "./products";
import { sql } from "drizzle-orm";

export const productImagesTable = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().notNull(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    objectKey: varchar("object_key", { length: 500 }).notNull(),
    altText: varchar("alt_text", { length: 300 }),
    displayOrder: integer("display_order").default(0).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("uq_product_images_product_id_primary")
      .on(table.productId)
      .where(sql`${table.isPrimary} = TRUE`),
    check(
      "ck_product_images_display_order_non_negative",
      sql`${table.displayOrder} >= 0`,
    ),
  ],
);
