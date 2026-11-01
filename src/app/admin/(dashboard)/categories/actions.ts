"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getActionProfile } from "@/lib/admin/action-profile";
import {
  type CategoryFormState,
  createCategory,
  deleteUnusedCategory,
  parseCategoryForm,
  setCategoryActive,
  updateCategory,
} from "@/lib/admin/categories";

const invalidFormMessage = "Revisa los campos marcados para continuar.";

/** Category names and status show across the admin and the storefront. */
function revalidateCategories() {
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
}

function returnToList(estado: string): never {
  redirect(`/admin/categories?estado=${estado}`);
}

async function requireActionProfile() {
  const profile = await getActionProfile();

  if (!profile) {
    // The admin layout explains why the account has no access.
    redirect("/admin");
  }

  return profile;
}

async function saveCategory(
  previousState: CategoryFormState,
  formData: FormData,
  categoryId?: string,
): Promise<CategoryFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  };
  const failed = (state: Omit<CategoryFormState, "status" | "attempt">) => ({
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

  const parsed = parseCategoryForm(values);

  if (!parsed.success) {
    return failed({
      message: invalidFormMessage,
      fieldErrors: parsed.fieldErrors,
    });
  }

  const result = categoryId
    ? await updateCategory(profile, categoryId, parsed.data)
    : await createCategory(profile, parsed.data);

  if (!result.ok) {
    if (result.reason !== "INVALID") {
      notFound();
    }

    return failed({
      message: invalidFormMessage,
      fieldErrors: result.fieldErrors,
    });
  }

  revalidateCategories();
  returnToList(categoryId ? "actualizada" : "creada");
}

export async function createCategoryAction(
  previousState: CategoryFormState,
  formData: FormData,
) {
  return saveCategory(previousState, formData);
}

export async function updateCategoryAction(
  categoryId: string,
  previousState: CategoryFormState,
  formData: FormData,
) {
  return saveCategory(previousState, formData, categoryId);
}

export async function setCategoryActiveAction(
  categoryId: string,
  isActive: boolean,
) {
  const profile = await requireActionProfile();
  const result = await setCategoryActive(profile, categoryId, isActive);

  if (!result.ok) {
    notFound();
  }

  revalidateCategories();
  returnToList(isActive ? "activada" : "desactivada");
}

export async function deleteCategoryAction(categoryId: string) {
  const profile = await requireActionProfile();
  const result = await deleteUnusedCategory(profile, categoryId);

  if (!result.ok) {
    if (result.reason === "IN_USE") {
      returnToList("en-uso");
    }

    notFound();
  }

  revalidateCategories();
  returnToList("eliminada");
}
