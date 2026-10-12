"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getActionProfile } from "@/lib/admin/action-profile";
import {
  parsePresentationForm,
  type PresentationFormState,
  readPresentationFormValues,
} from "@/lib/admin/presentation-form";
import {
  createPresentation,
  deletePresentation,
  movePresentation,
  updatePresentation,
} from "@/lib/admin/presentation-mutations";
import {
  changeProductStatus,
  type ProductStatus,
} from "@/lib/admin/product-publication";

const invalidFormMessage = "Revisa los campos marcados para continuar.";

function productPath(productId: string) {
  return `/admin/products/${productId}`;
}

function revalidateProduct(productId: string) {
  revalidatePath(productPath(productId));
  revalidatePath("/admin/products");
  revalidatePath("/");
}

/** Back to the product page with a confirmation or a notice to show. */
function returnToProduct(
  productId: string,
  param: "estado" | "aviso",
  value: string,
): never {
  redirect(`${productPath(productId)}?${param}=${value}`);
}

async function requireActionProfile() {
  const profile = await getActionProfile();

  if (!profile) {
    // The admin layout explains why the account has no access.
    redirect("/admin");
  }

  return profile;
}

async function savePresentation(
  previousState: PresentationFormState,
  formData: FormData,
  productId: string,
  presentationId?: string,
): Promise<PresentationFormState> {
  const values = readPresentationFormValues(formData);
  const failed = (
    state: Omit<PresentationFormState, "status" | "attempt">,
  ) => ({
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

  const parsed = parsePresentationForm(values);

  if (!parsed.success) {
    return failed({
      message: invalidFormMessage,
      fieldErrors: parsed.fieldErrors,
    });
  }

  const result = presentationId
    ? await updatePresentation(profile, productId, presentationId, parsed.data)
    : await createPresentation(profile, productId, parsed.data);

  if (!result.ok) {
    if (result.reason !== "INVALID") {
      notFound();
    }

    return failed({
      message: invalidFormMessage,
      fieldErrors: result.fieldErrors,
    });
  }

  revalidateProduct(productId);
  returnToProduct(
    productId,
    "estado",
    presentationId ? "presentacion-actualizada" : "presentacion-creada",
  );
}

export async function createPresentationAction(
  productId: string,
  previousState: PresentationFormState,
  formData: FormData,
) {
  return savePresentation(previousState, formData, productId);
}

export async function updatePresentationAction(
  productId: string,
  presentationId: string,
  previousState: PresentationFormState,
  formData: FormData,
) {
  return savePresentation(previousState, formData, productId, presentationId);
}

export async function deletePresentationAction(
  productId: string,
  presentationId: string,
) {
  const profile = await requireActionProfile();
  const result = await deletePresentation(profile, productId, presentationId);

  if (!result.ok) {
    if (result.reason === "LAST_AVAILABLE") {
      returnToProduct(productId, "aviso", "ultima-presentacion");
    }

    notFound();
  }

  revalidateProduct(productId);
  returnToProduct(productId, "estado", "presentacion-eliminada");
}

export async function movePresentationAction(
  productId: string,
  presentationId: string,
  direction: "up" | "down",
) {
  const profile = await requireActionProfile();
  const result = await movePresentation(
    profile,
    productId,
    presentationId,
    direction,
  );

  if (!result.ok) {
    notFound();
  }

  revalidateProduct(productId);
}

export async function changeProductStatusAction(
  productId: string,
  target: ProductStatus,
) {
  const profile = await requireActionProfile();
  const result = await changeProductStatus(profile, productId, target);

  if (!result.ok) {
    switch (result.reason) {
      case "NOT_FOUND":
        notFound();
      case "REQUIREMENTS_NOT_MET":
        returnToProduct(productId, "aviso", "requisitos");
      case "INVALID_TRANSITION":
      case "CONFLICT":
        returnToProduct(productId, "aviso", "estado-cambiado");
    }
  }

  revalidateProduct(productId);
  returnToProduct(
    productId,
    "estado",
    target === "PUBLISHED" ? "publicado" : "pausado",
  );
}
