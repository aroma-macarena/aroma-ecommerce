import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminSection } from "@/components/admin/admin-section";
import { AssociationPhotosPanel } from "@/components/admin/association-photos-panel";
import { AssociationProfileForm } from "@/components/admin/association-profile-form";
import { ImageFieldForm } from "@/components/admin/image-field-form";
import { getAssociationPhotos } from "@/lib/admin/association-photos";
import type { AssociationProfile } from "@/lib/admin/association-profile";
import { getMediaUrl } from "@/lib/media";
import { getAssociationHref } from "@/lib/public-routes";
import { isMediaStorageConfigured } from "@/lib/storage/r2";
import { formatWhatsAppNumber } from "@/lib/whatsapp";

import {
  deleteAssociationPhotoAction,
  moveAssociationPhotoAction,
  removeAssociationImageAction,
  updateAssociationPhotoAction,
  updateAssociationProfileAction,
  uploadAssociationImageAction,
  uploadAssociationPhotoAction,
} from "./profile-actions";

const confirmations: Record<string, string> = {
  "perfil-actualizado": "Cambios guardados. Ya se ven en el perfil público.",
  "logo-actualizado": "Logo actualizado.",
  "logo-eliminado": "Logo quitado.",
  "portada-actualizada": "Portada actualizada.",
  "portada-eliminada": "Portada quitada.",
  "foto-agregada": "Foto agregada al perfil.",
  "foto-actualizada": "Textos de la foto guardados.",
  "fotos-ordenadas": "Orden de las fotos guardado.",
  "foto-eliminada": "Foto quitada.",
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
 * alliance's association list: text fields, logo, cover and photos.
 */
async function AssociationProfileEditor({
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
  const photos = await getAssociationPhotos(association.id);

  return (
    <>
      {confirmation ? (
        <AdminNotice tone="success">{confirmation}</AdminNotice>
      ) : null}
      {warning ? <AdminNotice tone="error">{warning}</AdminNotice> : null}

      <dl className="text-muted-foreground flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
        <dt className="text-sm">Dirección pública</dt>
        <dd className="text-foreground text-sm break-all">{publicHref}</dd>
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

      {/* Wide screens: the text form and the photos on the left; the logo
          and the cover, which save on their own, in a column on the right.
          Phones keep the reading order: form, logo, cover, photos. */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start xl:gap-8">
        <div className="min-w-0 xl:col-start-1 xl:row-start-1">
          <AssociationProfileForm
            action={updateAssociationProfileAction.bind(null, association.id)}
            canEditName={canEditName}
            cancelHref={cancelHref}
            defaultValues={{
              name: association.name,
              location: association.location ?? "",
              zone: association.zone ?? "",
              description: association.description ?? "",
              history: association.history ?? "",
              contactName: association.contactName ?? "",
              whatsappNumber: formatWhatsAppNumber(association.whatsappNumber),
            }}
          />
        </div>

        <div className="space-y-6 xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <AdminSection
            id="logo"
            title="Logo"
            description="Las imágenes se guardan al subirlas."
            ruled
          >
            {/* Keyed by the stored image, so saving or removing one starts a
            fresh form instead of keeping the local preview. */}
            <ImageFieldForm
              key={association.logoObjectKey ?? "none"}
              kind="logo"
              ownerName={association.name}
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

          <AdminSection id="portada" title="Portada">
            <ImageFieldForm
              key={association.coverObjectKey ?? "none"}
              kind="cover"
              ownerName={association.name}
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
        </div>

        <div className="min-w-0 xl:col-start-1 xl:row-start-2">
          <AdminSection
            id="fotos"
            title="Fotos"
            description="La primera se ve más grande."
          >
            <AssociationPhotosPanel
              associationName={association.name}
              photos={photos}
              canUpload={canUpload}
              uploadAction={uploadAssociationPhotoAction.bind(
                null,
                association.id,
              )}
              photoActions={Object.fromEntries(
                photos.map((photo) => [
                  photo.id,
                  {
                    update: updateAssociationPhotoAction.bind(
                      null,
                      association.id,
                      photo.id,
                    ),
                    moveUp: moveAssociationPhotoAction.bind(
                      null,
                      association.id,
                      photo.id,
                      "up",
                    ),
                    moveDown: moveAssociationPhotoAction.bind(
                      null,
                      association.id,
                      photo.id,
                      "down",
                    ),
                    remove: deleteAssociationPhotoAction.bind(
                      null,
                      association.id,
                      photo.id,
                    ),
                  },
                ]),
              )}
            />
          </AdminSection>
        </div>
      </div>
    </>
  );
}

export { AssociationProfileEditor };
