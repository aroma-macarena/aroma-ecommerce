import { z } from "zod";

/**
 * Client-safe pieces of administrator management: the form schema, its
 * parsing and the form state. The database and Clerk code lives in
 * `admin-users.ts`.
 */

export const adminRoles = ["SUPER_ADMIN", "ASSOCIATION_ADMIN"] as const;
export type AdminUserRole = (typeof adminRoles)[number];

const name = z
  .string()
  .trim()
  .min(1, "Escribe el nombre de la persona.")
  .max(150, "El nombre puede tener hasta 150 caracteres.");

const role = z.enum(adminRoles, { error: "Elige un rol." });

const associationId = z
  .string()
  .trim()
  .transform((value) => value || null);

export const adminUserSchema = z
  .object({
    name,
    email: z
      .string()
      .trim()
      .min(1, "Escribe el correo de la persona.")
      .max(255, "El correo puede tener hasta 255 caracteres.")
      .pipe(z.email("Escribe un correo válido, como nombre@ejemplo.com."))
      .transform((value) => value.toLowerCase()),
    role,
    associationId,
  })
  .superRefine(requireAssociationForAssociationAdmins);

/** Editing keeps the email: it belongs to the person's Clerk account. */
export const adminUserUpdateSchema = z
  .object({ name, role, associationId })
  .superRefine(requireAssociationForAssociationAdmins);

function requireAssociationForAssociationAdmins(
  value: { role: AdminUserRole; associationId: string | null },
  context: z.RefinementCtx,
) {
  if (value.role === "ASSOCIATION_ADMIN" && !value.associationId) {
    context.addIssue({
      code: "custom",
      path: ["associationId"],
      message: "Elige la asociación que administrará.",
    });
  }
}

export type AdminUserInput = z.infer<typeof adminUserSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;

export const adminUserFields = [
  "name",
  "email",
  "role",
  "associationId",
] as const;
export type AdminUserField = (typeof adminUserFields)[number];
export type AdminUserFieldErrors = Partial<Record<AdminUserField, string>>;
export type AdminUserFormValues = Record<AdminUserField, string>;

function parse<T>(schema: z.ZodType<T>, values: Partial<AdminUserFormValues>) {
  const result = schema.safeParse({
    name: values.name ?? "",
    email: values.email ?? "",
    role: values.role ?? "",
    associationId: values.associationId ?? "",
  });

  if (result.success) {
    return { success: true as const, data: result.data };
  }

  const fieldErrors: AdminUserFieldErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0] as AdminUserField;
    fieldErrors[field] ??= issue.message;
  }

  return { success: false as const, fieldErrors };
}

export function parseAdminUser(values: Partial<AdminUserFormValues>) {
  return parse(adminUserSchema, values);
}

export function parseAdminUserUpdate(values: Partial<AdminUserFormValues>) {
  return parse(adminUserUpdateSchema, values);
}

export type AdminUserFormState = {
  status: "idle" | "error";
  /** Increases on every failed submission so the form can restore values. */
  attempt: number;
  message?: string;
  fieldErrors?: AdminUserFieldErrors;
  values?: AdminUserFormValues;
};
