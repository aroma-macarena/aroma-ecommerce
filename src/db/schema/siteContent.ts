import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { profilesTable as profiles } from "./profiles";

export const siteContentTable = pgTable("site_content", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 250 }),
  content: text("content").notNull(),
  updatedBy: uuid("updated_by").references(() => profiles.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});
