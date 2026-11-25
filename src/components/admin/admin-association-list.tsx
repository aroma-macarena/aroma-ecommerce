import { ExternalLink, Pause, Play } from "lucide-react";
import Link from "next/link";

import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { ActiveStatusBadge } from "@/components/admin/status-badge";
import type { AdminAssociation } from "@/lib/admin/associations";
import { profileGaps, sentence } from "@/lib/admin/dashboard";
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
        triggerVariant="ghost"
        triggerClassName="text-muted-foreground whitespace-nowrap"
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
      triggerVariant="ghost"
      triggerClassName="text-muted-foreground whitespace-nowrap"
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
    <div className="flex sm:justify-end">
      <StatusAction
        association={association}
        setStatusAction={setStatusAction}
      />
    </div>
  );
}

/** The public profile, as an icon beside the name. */
function PublicProfileLink({ association }: { association: AdminAssociation }) {
  if (association.status !== "ACTIVE") {
    return null;
  }

  return (
    <Link
      href={getAssociationHref(association.slug)}
      target="_blank"
      aria-label={`Ver el perfil público de ${association.name} (se abre en una nueva pestaña)`}
      title="Ver perfil público"
      className="text-muted-foreground hover:text-primary relative z-10 -my-2 inline-flex size-9 shrink-0 items-center justify-center rounded-md"
    >
      <ExternalLink aria-hidden className="size-4" />
    </Link>
  );
}

/** What the profile lacks, with the same correction mark as «Te falta». */
function ProfileGaps({ association }: { association: AdminAssociation }) {
  const gaps = profileGaps(association);
  if (association.status !== "ACTIVE" || gaps.length === 0) return null;
  return (
    <span className="text-correction flex items-center gap-1.5 text-sm font-bold">
      <span
        aria-hidden
        className="border-correction size-3 shrink-0 rounded-full border-2"
      />
      {sentence(gaps)}
    </span>
  );
}

/** Associations as a table on desktop and stacked rows on mobile. */
function AdminAssociationList({
  associations,
  setStatusAction,
}: AdminAssociationListProps) {
  return (
    <div className="bg-card overflow-hidden rounded-md border">
      <table className="hidden w-full xl:table">
        <caption className="sr-only">Asociaciones de la alianza</caption>
        <thead>
          <tr className="bg-muted/60 text-muted-foreground border-b text-left text-sm">
            <th scope="col" className="py-2.5 pr-4 font-bold first:pl-4">
              Asociación
            </th>
            <th scope="col" className="py-2.5 pr-4 font-bold first:pl-4">
              Estado
            </th>
            <th scope="col" className="py-2.5 pr-4 font-bold first:pl-4">
              Publicados
            </th>
            <th scope="col" className="py-2.5 pr-4 font-bold first:pl-4">
              Cuentas
            </th>
            <th scope="col" className="py-2.5 pr-4 text-right font-bold">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {associations.map((association) => (
            <tr
              key={association.id}
              className="border-b align-top last:border-b-0"
            >
              <th scope="row" className="py-3 pr-4 pl-4 text-left font-normal">
                <span className="flex items-center gap-1">
                  <Link
                    href={`/admin/associations/${association.id}/edit`}
                    className="text-primary font-bold underline-offset-4 hover:underline"
                  >
                    {association.name}
                  </Link>
                  <PublicProfileLink association={association} />
                </span>
                {association.location ? (
                  <span className="text-muted-foreground block text-sm">
                    {association.location}
                  </span>
                ) : null}
                <ProfileGaps association={association} />
              </th>
              <td className="py-3 pr-4">
                <ActiveStatusBadge status={association.status} />
              </td>
              <td className="py-3 pr-4 whitespace-nowrap">
                {association.publishedCount}{" "}
                <span className="text-muted-foreground">
                  de {association.productCount}
                </span>
              </td>
              <td className="py-3 pr-4 whitespace-nowrap">
                {association.adminCount}
              </td>
              <td className="py-0.5 pr-4 text-right">
                <RowActions
                  association={association}
                  setStatusAction={setStatusAction}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul aria-label="Asociaciones de la alianza" className="xl:hidden">
        {associations.map((association) => (
          <li
            key={association.id}
            className="space-y-1 border-b px-4 py-3 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex min-w-0 items-center gap-1">
                <Link
                  href={`/admin/associations/${association.id}/edit`}
                  className="text-primary min-w-0 font-bold wrap-anywhere underline-offset-4 hover:underline"
                >
                  {association.name}
                </Link>
                <PublicProfileLink association={association} />
              </span>
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
            <ProfileGaps association={association} />
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm">
                {association.publishedCount}{" "}
                <span className="text-muted-foreground">
                  de {association.productCount}{" "}
                  {association.publishedCount === 1
                    ? "publicado"
                    : "publicados"}{" "}
                  · {countLabel(association.adminCount, "cuenta", "cuentas")}
                </span>
              </p>
              <div className="-mr-3 shrink-0">
                <RowActions
                  association={association}
                  setStatusAction={setStatusAction}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { AdminAssociationList };
