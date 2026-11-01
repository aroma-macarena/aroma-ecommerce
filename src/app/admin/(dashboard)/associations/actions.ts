"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getActionProfile } from "@/lib/admin/action-profile";
import {
  type AssociationFormState,
  type AssociationStatus,
  createAssociation,
  parseAssociationForm,
  setAssociationStatus,
} from "@/lib/admin/associations";

/** Public pages and the admin depend on an association's status. */
function revalidateAssociations() {
  revalidatePath("/admin/associations");
  revalidatePath("/asociaciones", "layout");
  revalidatePath("/");
}

export async function createAssociationAction(
  previousState: AssociationFormState,
  formData: FormData,
): Promise<AssociationFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    location: String(formData.get("location") ?? ""),
  };
  const failed = (state: Omit<AssociationFormState, "status" | "attempt">) => ({
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

  const parsed = parseAssociationForm(values);

  if (!parsed.success) {
    return failed({
      message: "Revisa los campos marcados para continuar.",
      fieldErrors: parsed.fieldErrors,
    });
  }

  const result = await createAssociation(profile, parsed.data);

  if (!result.ok) {
    if (result.reason !== "INVALID") {
      notFound();
    }

    return failed({
      message: "Revisa los campos marcados para continuar.",
      fieldErrors: result.fieldErrors,
    });
  }

  revalidateAssociations();
  redirect("/admin/associations?estado=creada");
}

export async function setAssociationStatusAction(
  associationId: string,
  status: AssociationStatus,
) {
  const profile = await getActionProfile();

  if (!profile) {
    // The admin layout explains why the account has no access.
    redirect("/admin");
  }

  const result = await setAssociationStatus(profile, associationId, status);

  if (!result.ok) {
    notFound();
  }

  revalidateAssociations();
  redirect(
    `/admin/associations?estado=${status === "ACTIVE" ? "activada" : "desactivada"}`,
  );
}
