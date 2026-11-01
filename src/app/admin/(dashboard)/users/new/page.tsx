import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUserForm } from "@/components/admin/admin-user-form";
import { getAssignableAssociations } from "@/lib/admin/admin-users";
import { isSuperAdmin } from "@/lib/auth/authorization";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import { createAdminUserAction } from "../actions";

export const metadata: Metadata = {
  title: "Nuevo usuario",
};

export default async function NewAdminUserPage() {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  if (!isSuperAdmin(result.currentProfile)) {
    notFound();
  }

  const associations = await getAssignableAssociations(result.currentProfile);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href="/admin/users">Usuarios</AdminBackLink>
        <AdminPageHeader
          eyebrow="Alianza AROMA"
          title="Nuevo usuario"
          description="Le enviaremos una invitación por correo. El acceso es solo por invitación: nadie puede registrarse por su cuenta."
        />
      </div>

      <AdminUserForm
        action={createAdminUserAction}
        associations={associations}
        cancelHref="/admin/users"
        submitLabel="Enviar invitación"
      />
    </div>
  );
}
