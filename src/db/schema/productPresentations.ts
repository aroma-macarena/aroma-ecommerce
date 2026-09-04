import {
  boolean,
  decimal,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { productsTable as products } from "./products";

export const productPresentationsTable = pgTable("product_presentations", {
  id: uuid("id").primaryKey().notNull(),
  productId: uuid("product_id").references(() => products.id),
  name: varchar("name", { length: 150 }).notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 3 }),
  unit: varchar("unit", { length: 50 }),
  referencePrice: decimal("reference_price", { precision: 12, scale: 2 }),
  isAvailable: boolean("is_available").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});
