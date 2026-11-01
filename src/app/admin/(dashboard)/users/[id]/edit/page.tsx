import { Mail, Pause, Play, X } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminUserForm } from "@/components/admin/admin-user-form";
import { AccountStatusBadge } from "@/components/admin/admin-user-list";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import {
  getAssignableAssociations,
  getEditableAdminUser,
} from "@/lib/admin/admin-users";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import {
  cancelInvitationAction,
  resendInvitationAction,
  setAdminUserStatusAction,
  updateAdminUserAction,
} from "../../actions";

export const metadata: Metadata = {
  title: "Editar usuario",
};

const confirmations: Record<string, string> = {
  reenviada: "Invitación reenviada. La anterior ya no sirve.",
};

const notices: Record<string, string> = {
  "sin-conexion":
    "No pudimos comunicarnos con el servicio de acceso. La invitación no se reenvió; intenta de nuevo en unos minutos.",
  "sin-conexion-cancelar":
    "No pudimos comunicarnos con el servicio de acceso. La invitación sigue vigente; intenta cancelarla de nuevo en unos minutos.",
  "reenviada-mientras":
    "Alguien reenvió la invitación mientras la cancelabas, así que la nueva sigue vigente. Si aún quieres cancelarla, inténtalo de nuevo.",
  "ya-aceptada":
    "La persona ya aceptó la invitación, así que no hay nada que reenviar ni cancelar.",
};

export default async function EditAdminUserPage({
  params,
  searchParams,
}: PageProps<"/admin/users/[id]/edit">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const user = await getEditableAdminUser(
    result.currentProfile,
    (await params).id,
  );

  // Also covers association administrators, for whom this is not available.
  if (!user) {
    notFound();
  }

  const associations = await getAssignableAssociations(result.currentProfile);
  const isSelf = user.id === result.currentProfile.id;
  const { estado, aviso } = await searchParams;
  const confirmation =
    typeof estado === "string" ? confirmations[estado] : undefined;
  const notice = typeof aviso === "string" ? notices[aviso] : undefined;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href="/admin/users">Usuarios</AdminBackLink>
        <AdminPageHeader
          eyebrow="Alianza AROMA"
          title={user.name}
          description={
            isSelf
              ? "Tu propia cuenta: puedes cambiar tu nombre."
              : "Cambia su nombre, su rol o la asociación que administra."
          }
          actions={<AccountStatusBadge user={user} />}
        />
      </div>

      {confirmation ? (
        <AdminNotice tone="success">{confirmation}</AdminNotice>
      ) : null}
      {notice ? <AdminNotice tone="warning">{notice}</AdminNotice> : null}

      <AdminSection
        id="datos"
        title="Datos y rol"
        description="El rol decide qué puede hacer en el panel."
      >
        <AdminUserForm
          action={updateAdminUserAction.bind(null, user.id)}
          associations={associations}
          initialValues={{
            name: user.name,
            email: user.email,
            role: user.role,
            associationId: user.associationId ?? "",
          }}
          isSelf={isSelf}
          cancelHref="/admin/users"
          submitLabel="Guardar cambios"
        />
      </AdminSection>

      {user.isPending ? (
        <AdminSection
          id="invitacion"
          title="Invitación"
          description="Aún no ha creado su acceso."
        >
          <p className="max-w-prose text-sm leading-6">
            Enviamos la invitación a{" "}
            <span className="font-medium wrap-anywhere">{user.email}</span>. Si
            no la encuentra o venció, reenvíala. Si la persona ya no necesita
            acceso, cancélala.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <ConfirmActionButton
              trigger={
                <>
                  <Mail aria-hidden />
                  Reenviar invitación
                </>
              }
              triggerClassName="w-full sm:w-auto"
              title="¿Reenviar la invitación?"
              description={`Enviaremos un correo nuevo a ${user.email}. El enlace anterior dejará de funcionar.`}
              confirmLabel="Reenviar"
              pendingLabel="Reenviando…"
              action={resendInvitationAction.bind(null, user.id)}
            />
            <ConfirmActionButton
              trigger={
                <>
                  <X aria-hidden />
                  Cancelar invitación
                </>
              }
              triggerClassName="w-full sm:w-auto"
              title="¿Cancelar la invitación?"
              description={`El enlace enviado a ${user.email} dejará de funcionar y esta cuenta pendiente se borrará. Puedes invitarla de nuevo cuando quieras.`}
              confirmLabel="Cancelar invitación"
              pendingLabel="Cancelando…"
              tone="destructive"
              action={cancelInvitationAction.bind(null, user.id)}
            />
          </div>
        </AdminSection>
      ) : null}

      {isSelf ? null : (
        <AdminSection
          id="acceso"
          title="Acceso"
          description="Desactivar no borra la cuenta ni su historial."
        >
          {user.status === "ACTIVE" ? (
            <ConfirmActionButton
              trigger={
                <>
                  <Pause aria-hidden />
                  Desactivar cuenta
                </>
              }
              triggerClassName="w-full sm:w-auto"
              title={`¿Desactivar a ${user.name}?`}
              description="Perderá el acceso al panel de inmediato. Su cuenta de acceso y los cambios que hizo se conservan; puedes reactivarla cuando quieras."
              confirmLabel="Desactivar"
              pendingLabel="Desactivando…"
              tone="destructive"
              action={setAdminUserStatusAction.bind(null, user.id, "INACTIVE")}
            />
          ) : (
            <ConfirmActionButton
              trigger={
                <>
                  <Play aria-hidden />
                  Activar cuenta
                </>
              }
              triggerClassName="w-full sm:w-auto"
              title={`¿Activar a ${user.name}?`}
              description="Podrá entrar de nuevo al panel con su rol y su asociación actuales."
              confirmLabel="Activar"
              pendingLabel="Activando…"
              action={setAdminUserStatusAction.bind(null, user.id, "ACTIVE")}
            />
          )}
        </AdminSection>
      )}
    </div>
  );
}
