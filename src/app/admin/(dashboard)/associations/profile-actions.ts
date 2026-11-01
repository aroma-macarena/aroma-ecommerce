"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getActionProfile } from "@/lib/admin/action-profile";
import {
  removeAssociationImage,
  setAssociationImage,
  updateAssociationProfile,
} from "@/lib/admin/association-profile";
import {
  type AssociationImageFormState,
  associationProfileFields,
  type AssociationProfileFormState,
  parseAssociationProfile,
} from "@/lib/admin/association-profile-form";
import { isSuperAdmin } from "@/lib/auth/authorization";
import type { AdminProfile } from "@/lib/auth/get-current-profile";
import type { AssociationImageKind } from "@/lib/storage/association-images";
import { isMediaStorageConfigured } from "@/lib/storage/r2";

const lostAccessMessage =
  "Tu acceso al panel cambió. Recarga la página para ver tu situación.";

/** Where each role edits a profile: its own page or the alliance list. */
function profilePath(profile: AdminProfile, associationId: string) {
  return isSuperAdmin(profile)
    ? `/admin/associations/${associationId}/edit`
    : "/admin/association";
}

function revalidateProfile() {
  revalidatePath("/admin", "layout");
  revalidatePath("/asociaciones", "layout");
  revalidatePath("/", "layout");
}

function returnToProfile(
  profile: AdminProfile,
  associationId: string,
  param: "estado" | "aviso",
  value: string,
): never {
  redirect(`${profilePath(profile, associationId)}?${param}=${value}`);
}

export async function updateAssociationProfileAction(
  associationId: string,
  previousState: AssociationProfileFormState,
  formData: FormData,
): Promise<AssociationProfileFormState> {
  const values = Object.fromEntries(
    associationProfileFields.map((field) => [
      field,
      String(formData.get(field) ?? ""),
    ]),
  );
  const failed = (
    state: Omit<AssociationProfileFormState, "status" | "attempt">,
  ) => ({
    status: "error" as const,
    attempt: previousState.attempt + 1,
    values,
    ...state,
  });

  const profile = await getActionProfile();

  if (!profile) {
    return failed({ message: lostAccessMessage });
  }

  const parsed = parseAssociationProfile(values);

  if (!parsed.success) {
    return failed({
      message: "Revisa los campos marcados para continuar.",
      fieldErrors: parsed.fieldErrors,
    });
  }

  const result = await updateAssociationProfile(
    profile,
    associationId,
    parsed.data,
  );

  if (!result.ok) {
    if (result.reason !== "INVALID") {
      notFound();
    }

    return failed({
      message: "Revisa los campos marcados para continuar.",
      fieldErrors: result.fieldErrors,
    });
  }

  revalidateProfile();
  returnToProfile(profile, associationId, "estado", "perfil-actualizado");
}

export async function uploadAssociationImageAction(
  associationId: string,
  kind: AssociationImageKind,
  previousState: AssociationImageFormState,
  formData: FormData,
): Promise<AssociationImageFormState> {
  const failed = (message: string) => ({
    status: "error" as const,
    attempt: previousState.attempt + 1,
    message,
  });

  if (!isMediaStorageConfigured()) {
    return failed(
      "La subida de imágenes aún no está configurada. Avísale a la administración de la alianza.",
    );
  }

  const profile = await getActionProfile();

  if (!profile) {
    return failed(lostAccessMessage);
  }

  const file = formData.get("file");
  const result = await setAssociationImage(
    profile,
    associationId,
    kind,
    file instanceof File
      ? new Uint8Array(await file.arrayBuffer())
      : new Uint8Array(),
  );

  if (!result.ok) {
    switch (result.reason) {
      case "INVALID_FILE":
        return failed(result.message);
      case "STORAGE_ERROR":
        return failed(
          "No pudimos guardar la imagen. Intenta de nuevo en unos minutos.",
        );
      case "CONFLICT":
        return failed(
          "La imagen cambió mientras tanto. Recarga la página para ver la actual.",
        );
      default:
        notFound();
    }
  }

  revalidateProfile();
  returnToProfile(
    profile,
    associationId,
    "estado",
    kind === "logo" ? "logo-actualizado" : "portada-actualizada",
  );
}

export async function removeAssociationImageAction(
  associationId: string,
  kind: AssociationImageKind,
) {
  const profile = await getActionProfile();

  if (!profile) {
    // The admin layout explains why the account has no access.
    redirect("/admin");
  }

  const result = await removeAssociationImage(profile, associationId, kind);

  if (!result.ok) {
    if (result.reason === "STORAGE_ERROR") {
      returnToProfile(profile, associationId, "aviso", "imagen-no-eliminada");
    }

    notFound();
  }

  revalidateProfile();
  returnToProfile(
    profile,
    associationId,
    "estado",
    kind === "logo" ? "logo-eliminado" : "portada-eliminada",
  );
}
