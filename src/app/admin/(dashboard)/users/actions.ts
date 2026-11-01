"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getActionProfile } from "@/lib/admin/action-profile";
import {
  adminUserFields,
  type AdminUserFormState,
  type AdminUserFormValues,
  parseAdminUser,
  parseAdminUserUpdate,
} from "@/lib/admin/admin-user-form";
import {
  type AdminUserStatus,
  cancelInvitation,
  createAdminUser,
  resendInvitation,
  setAdminUserStatus,
  updateAdminUser,
} from "@/lib/admin/admin-users";

const PROVIDER_ERROR =
  "No pudimos comunicarnos con el servicio de acceso. No se guardó nada; intenta de nuevo en unos minutos.";
const ACCESS_CHANGED =
  "Tu acceso al panel cambió. Recarga la página para ver tu situación.";
const CHECK_FIELDS = "Revisa los campos marcados para continuar.";

function readValues(formData: FormData) {
  return Object.fromEntries(
    adminUserFields.map((field) => [field, String(formData.get(field) ?? "")]),
  ) as AdminUserFormValues;
}

function revalidateUsers() {
  revalidatePath("/admin/users");
  // Association rows count their accounts.
  revalidatePath("/admin/associations");
}

export async function createAdminUserAction(
  previousState: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  const values = readValues(formData);
  const failed = (state: Omit<AdminUserFormState, "status" | "attempt">) => ({
    status: "error" as const,
    attempt: previousState.attempt + 1,
    values,
    ...state,
  });

  const profile = await getActionProfile();

  if (!profile) {
    return failed({ message: ACCESS_CHANGED });
  }

  const parsed = parseAdminUser(values);

  if (!parsed.success) {
    return failed({ message: CHECK_FIELDS, fieldErrors: parsed.fieldErrors });
  }

  const result = await createAdminUser(profile, parsed.data);

  if (!result.ok) {
    if (result.reason === "INVALID") {
      return failed({ message: CHECK_FIELDS, fieldErrors: result.fieldErrors });
    }
    if (result.reason === "PROVIDER_ERROR") {
      return failed({ message: PROVIDER_ERROR });
    }
    notFound();
  }

  revalidateUsers();
  redirect(`/admin/users?estado=${result.invited ? "invitado" : "enlazado"}`);
}

export async function updateAdminUserAction(
  userId: string,
  previousState: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  const values = readValues(formData);
  const failed = (state: Omit<AdminUserFormState, "status" | "attempt">) => ({
    status: "error" as const,
    attempt: previousState.attempt + 1,
    values,
    ...state,
  });

  const profile = await getActionProfile();

  if (!profile) {
    return failed({ message: ACCESS_CHANGED });
  }

  const parsed = parseAdminUserUpdate(values);

  if (!parsed.success) {
    return failed({ message: CHECK_FIELDS, fieldErrors: parsed.fieldErrors });
  }

  const result = await updateAdminUser(profile, userId, parsed.data);

  if (!result.ok) {
    if (result.reason === "INVALID") {
      return failed({ message: CHECK_FIELDS, fieldErrors: result.fieldErrors });
    }
    notFound();
  }

  revalidateUsers();
  redirect("/admin/users?estado=actualizado");
}

export async function setAdminUserStatusAction(
  userId: string,
  status: AdminUserStatus,
) {
  const profile = await getActionProfile();

  if (!profile) {
    // The admin layout explains why the account has no access.
    redirect("/admin");
  }

  const result = await setAdminUserStatus(profile, userId, status);

  if (!result.ok) {
    notFound();
  }

  revalidateUsers();
  redirect(
    `/admin/users?estado=${status === "ACTIVE" ? "activado" : "desactivado"}`,
  );
}

export async function resendInvitationAction(userId: string) {
  const profile = await getActionProfile();

  if (!profile) {
    redirect("/admin");
  }

  const result = await resendInvitation(profile, userId);

  if (!result.ok) {
    if (result.reason === "PROVIDER_ERROR") {
      redirect(`/admin/users/${userId}/edit?aviso=sin-conexion`);
    }
    if (result.reason === "NOT_PENDING") {
      // Accepted meanwhile: the page now shows the linked account.
      redirect(`/admin/users/${userId}/edit?aviso=ya-aceptada`);
    }
    notFound();
  }

  revalidateUsers();
  redirect(`/admin/users/${userId}/edit?estado=reenviada`);
}

export async function cancelInvitationAction(userId: string) {
  const profile = await getActionProfile();

  if (!profile) {
    redirect("/admin");
  }

  const result = await cancelInvitation(profile, userId);

  if (!result.ok) {
    if (result.reason === "NOT_PENDING") {
      redirect(`/admin/users/${userId}/edit?aviso=ya-aceptada`);
    }
    notFound();
  }

  revalidateUsers();
  redirect("/admin/users?estado=cancelada");
}
