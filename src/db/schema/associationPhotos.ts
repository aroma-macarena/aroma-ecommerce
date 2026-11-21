import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { associationsTable as associations } from "./associations";

/**
 * Photos of an association's work and territory, shown as a mosaic on its
 * public profile, in `display_order`.
 */
export const associationPhotosTable = pgTable(
  "association_photos",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    associationId: uuid("association_id")
      .notNull()
      .references(() => associations.id, { onDelete: "cascade" }),
    objectKey: varchar("object_key", { length: 500 }).notNull(),
    altText: varchar("alt_text", { length: 300 }),
    caption: varchar("caption", { length: 160 }),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("ix_association_photos_association_id").on(table.associationId),
    check(
      "ck_association_photos_display_order_non_negative",
      sql`${table.displayOrder} >= 0`,
    ),
  ],
);
