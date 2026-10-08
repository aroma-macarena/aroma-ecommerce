import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { AdminShell } from "@/components/admin/admin-shell";
import getCurrentProfile from "@/lib/auth/get-current-profile";

export const metadata: Metadata = {
  title: "Administración",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getCurrentProfile();

  switch (result.status) {
    case "UNAUTHENTICATED":
      redirect("/admin/sign-in");

    case "PROFILE_NOT_FOUND":
      return (
        <AdminAccessNotice
          title="Acceso no habilitado"
          description="Tu cuenta no tiene un perfil administrativo asociado."
        />
      );

    case "INACTIVE":
      return (
        <AdminAccessNotice
          title="Cuenta inactiva"
          description="Tu acceso administrativo se encuentra deshabilitado."
        />
      );

    case "ASSOCIATION_INACTIVE":
      return (
        <AdminAccessNotice
          title="Asociación inactiva"
          description="La asociación de tu cuenta se encuentra deshabilitada."
        />
      );

    case "ACTIVE":
      return (
        <AdminShell profile={result.currentProfile}>{children}</AdminShell>
      );
  }
}
