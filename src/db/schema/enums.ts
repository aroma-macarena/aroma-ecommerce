import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "SUPER_ADMIN",
  "ASSOCIATION_ADMIN",
]);

export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "INACTIVE"]);

export const associationStatus = pgEnum("association_status", [
  "ACTIVE",
  "INACTIVE",
]);

export const productStatus = pgEnum("product_status", [
  "DRAFT",
  "PUBLISHED",
  "PAUSED",
]);
