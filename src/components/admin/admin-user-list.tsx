import { Pause, Play } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { adminRoleLabels } from "@/components/admin/admin-navigation";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import type { AdminUser, AdminUserStatus } from "@/lib/admin/admin-users";
import { cn } from "@/lib/utils";

type AdminUserListProps = {
  users: AdminUser[];
  /** The signed-in administrator, who cannot deactivate themselves. */
  currentUserId: string;
  setStatusAction: (
    userId: string,
    status: AdminUserStatus,
  ) => () => Promise<void>;
};

type AccountState = "ACTIVE" | "INACTIVE" | "PENDING";

const accountStates: Record<
  AccountState,
  { label: string; className: string; marker: ReactNode }
> = {
  ACTIVE: {
    label: "Activa",
    className: "text-foreground bg-muted",
    marker: <circle cx="4" cy="4" r="4" className="fill-foreground" />,
  },
  PENDING: {
    label: "Invitación pendiente",
    className: "text-foreground bg-card border",
    marker: (
      <circle
        cx="4"
        cy="4"
        r="3.25"
        fill="none"
        strokeWidth="1.5"
        strokeDasharray="2 1.5"
        className="stroke-foreground"
      />
    ),
  },
  INACTIVE: {
    label: "Inactiva",
    className: "text-muted-foreground bg-muted",
    marker: (
      <rect
        x="0.75"
        y="0.75"
        width="6.5"
        height="6.5"
        fill="none"
        strokeWidth="1.5"
        className="stroke-muted-foreground"
      />
    ),
  },
};

/** Inactive wins over pending: an inactive invitation grants nothing. */
export function getAccountState(
  user: Pick<AdminUser, "status" | "isPending">,
): AccountState {
  if (user.status === "INACTIVE") {
    return "INACTIVE";
  }

  return user.isPending ? "PENDING" : "ACTIVE";
}

/** Account status with a shape and a label, never by color alone. */
export function AccountStatusBadge({
  user,
  className,
}: {
  user: Pick<AdminUser, "status" | "isPending">;
  className?: string;
}) {
  const {
    label,
    className: toneClassName,
    marker,
  } = accountStates[getAccountState(user)];

  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-[0.8125rem] font-bold whitespace-nowrap",
        toneClassName,
        className,
      )}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
        {marker}
      </svg>
      {label}
    </span>
  );
}

function StatusAction({
  user,
  setStatusAction,
}: {
  user: AdminUser;
  setStatusAction: AdminUserListProps["setStatusAction"];
}) {
  if (user.status === "ACTIVE") {
    return (
      <ConfirmActionButton
        trigger={
          <>
            <Pause aria-hidden />
            Desactivar
            <span className="sr-only">{user.name}</span>
          </>
        }
        triggerVariant="ghost"
        triggerClassName="text-muted-foreground"
        title={`¿Desactivar a ${user.name}?`}
        description="Perderá el acceso al panel de inmediato. Su cuenta de acceso y los cambios que hizo se conservan; puedes reactivarla cuando quieras."
        confirmLabel="Desactivar"
        pendingLabel="Desactivando…"
        tone="destructive"
        action={setStatusAction(user.id, "INACTIVE")}
      />
    );
  }

  return (
    <ConfirmActionButton
      trigger={
        <>
          <Play aria-hidden />
          Activar
          <span className="sr-only">{user.name}</span>
        </>
      }
      triggerVariant="ghost"
      triggerClassName="text-muted-foreground"
      title={`¿Activar a ${user.name}?`}
      description="Podrá entrar de nuevo al panel con su rol y su asociación actuales."
      confirmLabel="Activar"
      pendingLabel="Activando…"
      action={setStatusAction(user.id, "ACTIVE")}
    />
  );
}

function RowActions({
  user,
  isSelf,
  setStatusAction,
}: {
  user: AdminUser;
  isSelf: boolean;
  setStatusAction: AdminUserListProps["setStatusAction"];
}) {
  return (
    // The name opens the account; the row keeps only its status action.
    isSelf ? null : (
      <StatusAction user={user} setStatusAction={setStatusAction} />
    )
  );
}

function Person({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  return (
    <>
      <span className="block wrap-anywhere">
        <Link
          href={`/admin/users/${user.id}/edit`}
          className="text-primary font-bold underline-offset-4 hover:underline"
        >
          {user.name}
        </Link>
        {isSelf ? (
          <span className="text-muted-foreground font-normal"> (tú)</span>
        ) : null}
      </span>
      <span className="text-muted-foreground block text-sm wrap-anywhere">
        {user.email}
      </span>
    </>
  );
}

function Scope({ user }: { user: AdminUser }) {
  if (user.role === "SUPER_ADMIN") {
    return <span className="text-muted-foreground">Toda la alianza</span>;
  }

  return (
    <>
      {user.associationName}
      {user.associationStatus === "INACTIVE" ? (
        <span className="text-muted-foreground block text-sm">
          Asociación inactiva
        </span>
      ) : null}
    </>
  );
}

/** Administrative accounts as a table on desktop and rows on mobile. */
function AdminUserList({
  users,
  currentUserId,
  setStatusAction,
}: AdminUserListProps) {
  return (
    <div className="bg-card overflow-hidden rounded-md border">
      <table className="hidden w-full xl:table">
        <caption className="sr-only">Cuentas administrativas</caption>
        <thead>
          <tr className="bg-muted/60 text-muted-foreground border-b text-left text-sm">
            <th scope="col" className="py-2.5 pr-4 font-bold first:pl-4">
              Persona
            </th>
            <th scope="col" className="py-2.5 pr-4 font-bold first:pl-4">
              Rol
            </th>
            <th scope="col" className="py-2.5 pr-4 font-bold first:pl-4">
              Asociación
            </th>
            <th scope="col" className="py-2.5 pr-4 font-bold first:pl-4">
              Estado
            </th>
            <th scope="col" className="py-2.5 pr-4 text-right font-bold">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;

            return (
              <tr key={user.id} className="border-b align-top last:border-b-0">
                <th
                  scope="row"
                  className="py-3 pr-4 pl-4 text-left font-normal"
                >
                  <Person user={user} isSelf={isSelf} />
                </th>
                <td className="py-3 pr-4">{adminRoleLabels[user.role]}</td>
                <td className="py-3 pr-4">
                  <Scope user={user} />
                </td>
                <td className="py-3 pr-4">
                  <AccountStatusBadge user={user} />
                </td>
                <td className="py-2 pr-4 text-right">
                  <RowActions
                    user={user}
                    isSelf={isSelf}
                    setStatusAction={setStatusAction}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ul aria-label="Cuentas administrativas" className="xl:hidden">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;

          return (
            <li
              key={user.id}
              className="space-y-1 border-b px-4 py-3 last:border-b-0"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0">
                  <Person user={user} isSelf={isSelf} />
                </p>
                <AccountStatusBadge user={user} className="pt-0.5" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm">
                  {adminRoleLabels[user.role]}
                  {user.role === "ASSOCIATION_ADMIN" ? (
                    <>
                      {" · "}
                      {user.associationName}
                      {user.associationStatus === "INACTIVE"
                        ? " (inactiva)"
                        : ""}
                    </>
                  ) : null}
                </p>
                <div className="-mr-3 shrink-0">
                  <RowActions
                    user={user}
                    isSelf={isSelf}
                    setStatusAction={setStatusAction}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { AdminUserList };
