import { Plus, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUserList } from "@/components/admin/admin-user-list";
import { buttonVariants } from "@/components/ui/button";
import { getAdminUsers } from "@/lib/admin/admin-users";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import { setAdminUserStatusAction } from "./actions";

export const metadata: Metadata = {
  title: "Usuarios",
};

const confirmations: Record<string, string> = {
  invitado:
    "Invitación enviada. La persona recibirá un correo para crear su acceso; su cuenta queda pendiente hasta que entre por primera vez.",
  enlazado:
    "Cuenta creada. Ese correo ya tenía acceso, así que puede entrar al panel de inmediato.",
  actualizado: "Cambios guardados.",
  activado: "Cuenta activada. Ya puede entrar al panel.",
  desactivado:
    "Cuenta desactivada. Ya no puede entrar al panel; sus datos y su historial se conservan.",
  cancelada: "Invitación cancelada.",
};

export default async function AdminUsersPage({
  searchParams,
}: PageProps<"/admin/users">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const users = await getAdminUsers(result.currentProfile);

  // Alliance-level management: association administrators do not see it.
  if (!users) {
    notFound();
  }

  const { estado } = await searchParams;
  const confirmation =
    typeof estado === "string" ? confirmations[estado] : undefined;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Alianza AROMA"
        title="Usuarios"
        description="Da acceso al panel a quienes administran la alianza y las asociaciones. Desactivar una cuenta le quita el acceso al instante, sin borrar su historial."
        actions={
          <Link
            href="/admin/users/new"
            className={buttonVariants({ className: "w-full md:w-auto" })}
          >
            <Plus aria-hidden />
            Nuevo usuario
          </Link>
        }
      />

      {confirmation ? (
        <AdminNotice tone="success">{confirmation}</AdminNotice>
      ) : null}

      {users.length > 0 ? (
        <AdminUserList
          users={users}
          currentUserId={result.currentProfile.id}
          setStatusAction={(userId, status) =>
            setAdminUserStatusAction.bind(null, userId, status)
          }
        />
      ) : (
        <AdminEmptyState
          icon={Users}
          title="Aún no hay cuentas"
          description="Invita a la primera persona que administrará una asociación."
        />
      )}
    </div>
  );
}
