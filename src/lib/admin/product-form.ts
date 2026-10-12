import { z } from "zod";

const optionalText = (maxLength: number, label: string) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} puede tener hasta ${maxLength} caracteres.`)
    .transform((value) => value || null);

/** Fields an administrator can edit, validated on the server. */
export const productFormSchema = z.object({
  associationId: z.string().trim().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Escribe el nombre del producto.")
    .max(200, "El nombre puede tener hasta 200 caracteres."),
  categoryId: z.string().trim().min(1, "Elige una categoría."),
  shortDescription: optionalText(500, "La descripción corta"),
  description: z
    .string()
    .trim()
    .max(5000, "La descripción puede tener hasta 5000 caracteres.")
    .transform((value) => value || null),
  origin: optionalText(255, "El origen"),
  ingredients: z
    .string()
    .trim()
    .max(2000, "Los ingredientes pueden tener hasta 2000 caracteres.")
    .transform((value) => value || null),
  availabilityNote: optionalText(500, "La nota de disponibilidad"),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

export const productFormFields = [
  "associationId",
  "name",
  "categoryId",
  "shortDescription",
  "description",
  "origin",
  "ingredients",
  "availabilityNote",
] as const;

export type ProductFormField = (typeof productFormFields)[number];
export type ProductFormValues = Partial<Record<ProductFormField, string>>;
export type ProductFieldErrors = Partial<Record<ProductFormField, string>>;

export type ProductFormState = {
  status: "idle" | "error";
  /** Increases on every failed submission so the form can restore values. */
  attempt: number;
  message?: string;
  fieldErrors?: ProductFieldErrors;
  values?: ProductFormValues;
};

export function readProductFormValues(formData: FormData): ProductFormValues {
  return Object.fromEntries(
    productFormFields.map((field) => [
      field,
      String(formData.get(field) ?? ""),
    ]),
  );
}

export function parseProductForm(values: ProductFormValues) {
  const result = productFormSchema.safeParse({
    ...values,
    name: values.name ?? "",
    categoryId: values.categoryId ?? "",
    shortDescription: values.shortDescription ?? "",
    description: values.description ?? "",
    origin: values.origin ?? "",
    ingredients: values.ingredients ?? "",
    availabilityNote: values.availabilityNote ?? "",
  });

  if (result.success) {
    return { success: true as const, data: result.data };
  }

  const fieldErrors: ProductFieldErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0] as ProductFormField;
    fieldErrors[field] ??= issue.message;
  }

  return { success: false as const, fieldErrors };
}
