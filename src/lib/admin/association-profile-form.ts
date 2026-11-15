import { z } from "zod";

import {
  INVALID_WHATSAPP_MESSAGE,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp";

// Safe for client components: no database or storage imports here.

const optionalText = (maxLength: number, label: string) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} puede tener hasta ${maxLength} caracteres.`)
    .transform((value) => value || null);

/** Public profile fields, validated on the server. */
export const associationProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escribe el nombre de la asociación.")
    .max(200, "El nombre puede tener hasta 200 caracteres."),
  location: optionalText(255, "La ubicación"),
  description: optionalText(2000, "La descripción"),
  history: optionalText(5000, "La historia"),
  contactName: optionalText(150, "El nombre de contacto"),
  whatsappNumber: z
    .string()
    .trim()
    .max(30, "El número puede tener hasta 30 caracteres.")
    .transform((value, context) => {
      if (!value) {
        return null;
      }

      // Stored as the public contact helpers will use it.
      const normalized = normalizeWhatsAppNumber(value);

      if (!normalized) {
        context.addIssue({
          code: "custom",
          message: INVALID_WHATSAPP_MESSAGE,
        });
        return z.NEVER;
      }

      return normalized;
    }),
});

export type AssociationProfileInput = z.infer<typeof associationProfileSchema>;
export type AssociationProfileField = keyof AssociationProfileInput;
export type AssociationProfileValues = Partial<
  Record<AssociationProfileField, string>
>;
export type AssociationProfileFieldErrors = Partial<
  Record<AssociationProfileField, string>
>;

export type AssociationProfileFormState = {
  status: "idle" | "error";
  /** Increases on every failed submission so the form can restore values. */
  attempt: number;
  message?: string;
  fieldErrors?: AssociationProfileFieldErrors;
  values?: AssociationProfileValues;
};

export type AssociationImageFormState = {
  status: "idle" | "error";
  /** Increases on every failed upload. */
  attempt: number;
  message?: string;
};

export const associationProfileFields = [
  "name",
  "location",
  "description",
  "history",
  "contactName",
  "whatsappNumber",
] as const satisfies readonly AssociationProfileField[];

export function parseAssociationProfile(values: AssociationProfileValues) {
  const result = associationProfileSchema.safeParse(
    Object.fromEntries(
      associationProfileFields.map((field) => [field, values[field] ?? ""]),
    ),
  );

  if (result.success) {
    return { success: true as const, data: result.data };
  }

  const fieldErrors: AssociationProfileFieldErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0] as AssociationProfileField;
    fieldErrors[field] ??= issue.message;
  }

  return { success: false as const, fieldErrors };
}
