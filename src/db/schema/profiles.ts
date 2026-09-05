import { check, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { associationsTable as associations } from "./associations";
import { userRoleEnum, userStatusEnum } from "./enums";
import { sql } from "drizzle-orm";

export const profilesTable = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    authUserId: varchar("auth_user_id", { length: 255 }).notNull().unique(),
    associationId: uuid("association_id").references(() => associations.id, {
      onDelete: "restrict",
    }),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    role: userRoleEnum("role").notNull(),
    status: userStatusEnum("status").default("ACTIVE").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    check(
      "ck_association_admin_requires_association",
      sql`${table.role} <> 'ASSOCIATION_ADMIN' OR ${table.associationId} IS NOT NULL`,
    ),
  ],
);
