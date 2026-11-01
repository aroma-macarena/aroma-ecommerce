import { z } from "zod";

const MAX_INTEGER_DIGITS = { quantity: 9, referencePrice: 10 };

const quantity = z
  .string()
  .trim()
  .transform((value, context) => {
    if (!value) {
      return null;
    }

    const normalized = value.replace(",", ".");

    if (!/^\d+(\.\d{1,3})?$/.test(normalized)) {
      context.addIssue({
        code: "custom",
        message: "Escribe una cantidad como 250 o 1,5, con hasta 3 decimales.",
      });
      return z.NEVER;
    }

    const [integerPart] = normalized.split(".");

    if (Number(normalized) <= 0) {
      context.addIssue({
        code: "custom",
        message: "La cantidad debe ser mayor que cero.",
      });
      return z.NEVER;
    }

    if (integerPart.replace(/^0+/, "").length > MAX_INTEGER_DIGITS.quantity) {
      context.addIssue({
        code: "custom",
        message: "La cantidad es demasiado grande.",
      });
      return z.NEVER;
    }

    return normalized;
  });

const referencePrice = z
  .string()
  .trim()
  .transform((value, context) => {
    const amount = value.replace(/^\$\s*/, "").replace(/\s/g, "");

    if (!amount) {
      return null;
    }

    // Whole pesos, optionally grouped with dots: 18000 or 18.000.
    if (!/^(\d+|\d{1,3}(\.\d{3})+)$/.test(amount)) {
      context.addIssue({
        code: "custom",
        message:
          "Escribe el precio en pesos, sin centavos. Por ejemplo: 18000 o 18.000.",
      });
      return z.NEVER;
    }

    const digits = amount.replace(/\./g, "").replace(/^0+(?=\d)/, "");

    if (digits.length > MAX_INTEGER_DIGITS.referencePrice) {
      context.addIssue({
        code: "custom",
        message: "El precio es demasiado alto.",
      });
      return z.NEVER;
    }

    return digits;
  });

/** Fields of a product presentation, validated on the server. */
export const presentationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escribe el nombre de la presentación.")
    .max(150, "El nombre puede tener hasta 150 caracteres."),
  quantity,
  unit: z
    .string()
    .trim()
    .max(50, "La unidad puede tener hasta 50 caracteres.")
    .transform((value) => value || null),
  referencePrice,
  isAvailable: z.boolean(),
});

export type PresentationFormInput = z.infer<typeof presentationFormSchema>;

export const presentationFormFields = [
  "name",
  "quantity",
  "unit",
  "referencePrice",
  "isAvailable",
] as const;

export type PresentationFormField = (typeof presentationFormFields)[number];
export type PresentationFormValues = Partial<
  Record<PresentationFormField, string>
>;
export type PresentationFieldErrors = Partial<
  Record<PresentationFormField, string>
>;

export type PresentationFormState = {
  status: "idle" | "error";
  /** Increases on every failed submission so the form can restore values. */
  attempt: number;
  message?: string;
  fieldErrors?: PresentationFieldErrors;
  values?: PresentationFormValues;
};

export function readPresentationFormValues(
  formData: FormData,
): PresentationFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    quantity: String(formData.get("quantity") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    referencePrice: String(formData.get("referencePrice") ?? ""),
    isAvailable: formData.get("isAvailable") === "on" ? "on" : "",
  };
}

export function parsePresentationForm(values: PresentationFormValues) {
  const result = presentationFormSchema.safeParse({
    name: values.name ?? "",
    quantity: values.quantity ?? "",
    unit: values.unit ?? "",
    referencePrice: values.referencePrice ?? "",
    isAvailable: values.isAvailable === "on",
  });

  if (result.success) {
    return { success: true as const, data: result.data };
  }

  const fieldErrors: PresentationFieldErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0] as PresentationFormField;
    fieldErrors[field] ??= issue.message;
  }

  return { success: false as const, fieldErrors };
}

/** Stored amounts as the form shows them: "1,5" and whole pesos. */
export function toPresentationFormValues(presentation: {
  name: string;
  quantity: string | null;
  unit: string | null;
  referencePrice: string | null;
  isAvailable: boolean;
}): PresentationFormValues {
  const trimDecimals = (value: string) =>
    value.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");

  return {
    name: presentation.name,
    quantity: presentation.quantity
      ? trimDecimals(presentation.quantity).replace(".", ",")
      : "",
    unit: presentation.unit ?? "",
    referencePrice: presentation.referencePrice
      ? trimDecimals(presentation.referencePrice).replace(".", ",")
      : "",
    isAvailable: presentation.isAvailable ? "on" : "",
  };
}
