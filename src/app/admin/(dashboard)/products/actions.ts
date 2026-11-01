"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getActionProfile } from "@/lib/admin/action-profile";
import {
  parseProductForm,
  type ProductFormState,
  readProductFormValues,
} from "@/lib/admin/product-form";
import { createProduct, updateProduct } from "@/lib/admin/product-mutations";

const invalidFormMessage = "Revisa los campos marcados para continuar.";

/** Authorization is checked again here: actions are public endpoints. */
async function saveProduct(
  previousState: ProductFormState,
  formData: FormData,
  productId?: string,
): Promise<ProductFormState> {
  const values = readProductFormValues(formData);
  const failed = (state: Omit<ProductFormState, "status" | "attempt">) => ({
    status: "error" as const,
    attempt: previousState.attempt + 1,
    values,
    ...state,
  });

  const profile = await getActionProfile();

  if (!profile) {
    return failed({
      message:
        "Tu acceso al panel cambió. Recarga la página para ver tu situación.",
    });
  }

  const parsed = parseProductForm(values);

  if (!parsed.success) {
    return failed({
      message: invalidFormMessage,
      fieldErrors: parsed.fieldErrors,
    });
  }

  const result = productId
    ? await updateProduct(profile, productId, parsed.data)
    : await createProduct(profile, parsed.data);

  if (!result.ok) {
    if (result.reason === "NOT_FOUND") {
      notFound();
    }

    return failed({
      message: invalidFormMessage,
      fieldErrors: result.fieldErrors,
    });
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${result.productId}`);
  revalidatePath("/");
  redirect(
    `/admin/products/${result.productId}?estado=${productId ? "actualizado" : "creado"}`,
  );
}

export async function createProductAction(
  previousState: ProductFormState,
  formData: FormData,
) {
  return saveProduct(previousState, formData);
}

export async function updateProductAction(
  productId: string,
  previousState: ProductFormState,
  formData: FormData,
) {
  return saveProduct(previousState, formData, productId);
}
