import { redirect } from "next/navigation";

import { AdminHeader } from "@/components/AdminHeader";
import getCurrentProfile from "@/lib/auth/get-current-profile";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = await getCurrentProfile();

  switch (status) {
    case "UNAUTHENTICATED":
      redirect("/admin/sign-in");

    case "PROFILE_NOT_FOUND":
      return (
        <main>
          <h1>Acceso no habilitado</h1>
          <p>Tu cuenta no tiene un perfil administrativo asociado.</p>
        </main>
      );

    case "INACTIVE":
      return (
        <main>
          <h1>Cuenta inactiva</h1>
          <p>Tu acceso administrativo se encuentra deshabilitado.</p>
        </main>
      );

    case "ACTIVE":
      return (
        <>
          <AdminHeader />
          {children}
        </>
      );
  }
}
