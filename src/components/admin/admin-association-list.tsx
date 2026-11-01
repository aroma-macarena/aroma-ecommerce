import { ExternalLink, Pause, Pencil, Play } from "lucide-react";
import Link from "next/link";

import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { ActiveStatusBadge } from "@/components/admin/status-badge";
import { buttonVariants } from "@/components/ui/button";
import type { AdminAssociation } from "@/lib/admin/associations";
import { getAssociationHref } from "@/lib/public-routes";

type AdminAssociationListProps = {
  associations: AdminAssociation[];
  setStatusAction: (
    associationId: string,
    status: "ACTIVE" | "INACTIVE",
  ) => () => Promise<void>;
};

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function StatusAction({
  association,
  setStatusAction,
}: {
  association: AdminAssociation;
  setStatusAction: AdminAssociationListProps["setStatusAction"];
}) {
  if (association.status === "ACTIVE") {
    return (
      <ConfirmActionButton
        trigger={
          <>
            <Pause aria-hidden />
            Desactivar
            <span className="sr-only">{association.name}</span>
          </>
        }
        triggerClassName="w-full sm:w-auto"
        title={`¿Desactivar ${association.name}?`}
        description="Sus productos dejarán de verse en la vitrina y su perfil público dejará de estar disponible. Sus administradoras no podrán entrar al panel. No se borra nada: al reactivarla, todo vuelve a estar como antes."
        confirmLabel="Desactivar"
        pendingLabel="Desactivando…"
        tone="destructive"
        action={setStatusAction(association.id, "INACTIVE")}
      />
    );
  }

  return (
    <ConfirmActionButton
      trigger={
        <>
          <Play aria-hidden />
          Activar
          <span className="sr-only">{association.name}</span>
        </>
      }
      triggerClassName="w-full sm:w-auto"
      title={`¿Activar ${association.name}?`}
      description="Su perfil y sus productos publicados volverán a verse en la vitrina, y sus administradoras podrán entrar de nuevo al panel."
      confirmLabel="Activar"
      pendingLabel="Activando…"
      action={setStatusAction(association.id, "ACTIVE")}
    />
  );
}

function RowActions({
  association,
  setStatusAction,
}: {
  association: AdminAssociation;
  setStatusAction: AdminAssociationListProps["setStatusAction"];
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      <Link
        href={`/admin/associations/${association.id}/edit`}
        className={buttonVariants({
          variant: "outline",
          className: "w-full sm:w-auto",
        })}
      >
        <Pencil aria-hidden />
        Editar
        <span className="sr-only">{association.name}</span>
      </Link>
      <StatusAction
        association={association}
        setStatusAction={setStatusAction}
      />
    </div>
  );
}

function PublicProfileLink({ association }: { association: AdminAssociation }) {
  if (association.status !== "ACTIVE") {
    return null;
  }

  return (
    <Link
      href={getAssociationHref(association.slug)}
      target="_blank"
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline"
    >
      Ver perfil público
      <ExternalLink aria-hidden className="size-3" />
      <span className="sr-only">(se abre en una nueva pestaña)</span>
    </Link>
  );
}

/** Associations as a table on desktop and stacked rows on mobile. */
function AdminAssociationList({
  associations,
  setStatusAction,
}: AdminAssociationListProps) {
  return (
    <>
      <table className="hidden w-full text-sm md:table">
        <caption className="sr-only">Asociaciones de la alianza</caption>
        <thead>
          <tr className="text-muted-foreground border-b text-left font-mono text-[0.6875rem] tracking-[0.06em] uppercase">
            <th scope="col" className="py-2 pr-4 font-medium">
              Asociación
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Estado
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Productos
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Cuentas
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {associations.map((association) => (
            <tr key={association.id} className="border-b align-top">
              <th scope="row" className="py-3 pr-4 text-left font-normal">
                <span className="block font-semibold">{association.name}</span>
                {association.location ? (
                  <span className="text-muted-foreground block text-xs">
                    {association.location}
                  </span>
                ) : null}
                <PublicProfileLink association={association} />
              </th>
              <td className="py-3 pr-4">
                <ActiveStatusBadge status={association.status} />
              </td>
              <td className="py-3 pr-4">
                {countLabel(
                  association.publishedCount,
                  "publicado",
                  "publicados",
                )}
                <span className="text-muted-foreground block text-xs">
                  de{" "}
                  {countLabel(
                    association.productCount,
                    "producto",
                    "productos",
                  )}
                </span>
              </td>
              <td className="py-3 pr-4">
                {countLabel(association.adminCount, "cuenta", "cuentas")}
              </td>
              <td className="py-3 text-right">
                <RowActions
                  association={association}
                  setStatusAction={setStatusAction}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul
        aria-label="Asociaciones de la alianza"
        className="border-t md:hidden"
      >
        {associations.map((association) => (
          <li key={association.id} className="space-y-2 border-b py-4">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 font-semibold wrap-anywhere">
                {association.name}
              </p>
              <ActiveStatusBadge
                status={association.status}
                className="pt-0.5"
              />
            </div>
            {association.location ? (
              <p className="text-muted-foreground text-sm">
                {association.location}
              </p>
            ) : null}
            <p className="text-muted-foreground font-mono text-xs">
              {countLabel(
                association.publishedCount,
                "publicado",
                "publicados",
              )}{" "}
              de {countLabel(association.productCount, "producto", "productos")}{" "}
              · {countLabel(association.adminCount, "cuenta", "cuentas")}
            </p>
            <PublicProfileLink association={association} />
            <div className="pt-1">
              <RowActions
                association={association}
                setStatusAction={setStatusAction}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export { AdminAssociationList };
