import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { associationStatus } from "./enums";

export const associationsTable = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  history: text("history"),
  location: varchar("location", { length: 255 }),
  contactName: varchar("contact_name", { length: 150 }),
  whatsappNumber: varchar("whatsapp_number", { length: 10 }),
  logoObjectKey: varchar("logo_object_key", { length: 500 }),
  coverObjectKey: varchar("cover_object_key", { length: 500 }),
  status: associationStatus("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});
