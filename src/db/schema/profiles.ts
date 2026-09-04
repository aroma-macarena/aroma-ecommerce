import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { associationsTable as associations } from "./associations";
import { userRoleEnum, userStatusEnum } from "./enums";

export const profilesTable = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(),
  authUserId: varchar("auth_user_id", { length: 255 }).notNull().unique(),
  associationId: uuid("association_id").references(() => associations.id),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  status: userStatusEnum("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});
