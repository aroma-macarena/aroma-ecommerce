import { sql } from "drizzle-orm";
import {
  check,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { associationsTable as associations } from "./associations";
import { userRoleEnum, userStatusEnum } from "./enums";

export const profilesTable = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    /** The Clerk user, once the person has an account. Null while invited. */
    authUserId: varchar("auth_user_id", { length: 255 }).unique(),
    /** The pending Clerk invitation, until the person accepts it. */
    invitationId: varchar("invitation_id", { length: 255 }).unique(),
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
    check(
      "ck_super_admin_without_association",
      sql`${table.role} <> 'SUPER_ADMIN' OR ${table.associationId} IS NULL`,
    ),
    // A profile is either linked to a Clerk user or waiting on an
    // invitation, never both and never neither.
    check(
      "ck_profile_linked_or_invited",
      sql`(${table.authUserId} IS NULL) <> (${table.invitationId} IS NULL)`,
    ),
    // One profile per email, ignoring case, so an invitation resolves to
    // exactly one profile.
    uniqueIndex("uq_profiles_email_lower").on(sql`lower(${table.email})`),
  ],
);
