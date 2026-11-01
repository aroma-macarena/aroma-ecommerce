import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminSection } from "@/components/admin/admin-section";
import { AssociationImageForm } from "@/components/admin/association-image-form";
import { AssociationProfileForm } from "@/components/admin/association-profile-form";
import type { AssociationProfile } from "@/lib/admin/association-profile";
import { getMediaUrl } from "@/lib/media";
import { getAssociationHref } from "@/lib/public-routes";
import { isMediaStorageConfigured } from "@/lib/storage/r2";
import { formatWhatsAppNumber } from "@/lib/whatsapp";

import {
  removeAssociationImageAction,
  updateAssociationProfileAction,
  uploadAssociationImageAction,
} from "./profile-actions";

const confirmations: Record<string, string> = {
  "perfil-actualizado": "Cambios guardados. Ya se ven en el perfil público.",
  "logo-actualizado": "Logo actualizado.",
  "logo-eliminado": "Logo quitado.",
  "portada-actualizada": "Portada actualizada.",
  "portada-eliminada": "Portada quitada.",
};

const warnings: Record<string, string> = {
  "imagen-no-eliminada":
    "No pudimos quitar la imagen del almacenamiento. Intenta de nuevo en unos minutos.",
};

type AssociationProfileEditorProps = {
  association: AssociationProfile;
  canEditName: boolean;
  cancelHref: string;
  estado?: string | string[];
  aviso?: string | string[];
};

/**
 * Public profile editing shared by an association's own page and the
 * alliance's association list: text fields, logo and cover.
 */
function AssociationProfileEditor({
  association,
  canEditName,
  cancelHref,
  estado,
  aviso,
}: AssociationProfileEditorProps) {
  const confirmation =
    typeof estado === "string" ? confirmations[estado] : undefined;
  const warning = typeof aviso === "string" ? warnings[aviso] : undefined;
  const canUpload = isMediaStorageConfigured();
  const publicHref = getAssociationHref(association.slug);

  return (
    <>
      {confirmation ? (
        <AdminNotice tone="success">{confirmation}</AdminNotice>
      ) : null}
      {warning ? <AdminNotice tone="error">{warning}</AdminNotice> : null}

      <dl className="text-muted-foreground flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
        <dt className="font-mono text-xs tracking-[0.06em] uppercase">
          Dirección pública
        </dt>
        <dd className="text-foreground font-mono text-xs break-all">
          {publicHref}
        </dd>
        {association.status === "ACTIVE" ? (
          <dd>
            <Link
              href={publicHref}
              target="_blank"
              className="hover:text-foreground inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline"
            >
              Ver perfil público
              <ExternalLink aria-hidden className="size-3" />
              <span className="sr-only">(se abre en una nueva pestaña)</span>
            </Link>
          </dd>
        ) : null}
        {canEditName ? (
          <dd className="w-full">
            No cambia al renombrarla, para no romper los enlaces ya compartidos.
          </dd>
        ) : null}
      </dl>

      <AssociationProfileForm
        action={updateAssociationProfileAction.bind(null, association.id)}
        canEditName={canEditName}
        cancelHref={cancelHref}
        defaultValues={{
          name: association.name,
          location: association.location ?? "",
          description: association.description ?? "",
          history: association.history ?? "",
          contactName: association.contactName ?? "",
          whatsappNumber: formatWhatsAppNumber(association.whatsappNumber),
        }}
      />

      <AdminSection
        id="logo"
        title="Logo"
        description="Aparece en el directorio y en el perfil. Cada imagen se guarda con su propio botón, aparte de la información."
        ruled
      >
        {/* Keyed by the stored image, so saving or removing one starts a
            fresh form instead of keeping the local preview. */}
        <AssociationImageForm
          key={association.logoObjectKey ?? "none"}
          kind="logo"
          associationName={association.name}
          currentUrl={getMediaUrl(association.logoObjectKey)}
          canUpload={canUpload}
          uploadAction={uploadAssociationImageAction.bind(
            null,
            association.id,
            "logo",
          )}
          removeAction={removeAssociationImageAction.bind(
            null,
            association.id,
            "logo",
          )}
        />
      </AdminSection>

      <AdminSection
        id="portada"
        title="Portada"
        description="La foto ancha con la que empieza el perfil público."
      >
        <AssociationImageForm
          key={association.coverObjectKey ?? "none"}
          kind="cover"
          associationName={association.name}
          currentUrl={getMediaUrl(association.coverObjectKey)}
          canUpload={canUpload}
          uploadAction={uploadAssociationImageAction.bind(
            null,
            association.id,
            "cover",
          )}
          removeAction={removeAssociationImageAction.bind(
            null,
            association.id,
            "cover",
          )}
        />
      </AdminSection>
    </>
  );
}

export { AssociationProfileEditor };
