"use client";

import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import {
  type FormEvent,
  startTransition,
  useActionState,
  useRef,
  useState,
} from "react";

import { AdminNotice } from "@/components/admin/admin-notice";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import {
  controlClassName,
  describedBy,
  Field,
  FormAlert,
} from "@/components/admin/form-fields";
import { ImageZoom } from "@/components/admin/image-zoom";
import { SubmitButton } from "@/components/admin/submit-button";
import {
  formatFileSize,
  useImageSelection,
} from "@/components/admin/use-image-selection";
import { Button, buttonVariants } from "@/components/ui/button";
import type { AssociationPhoto } from "@/lib/admin/association-photos";
import {
  ALT_TEXT_HINT,
  CAPTION_HINT,
  MAX_ALT_TEXT_LENGTH,
  MAX_CAPTION_LENGTH,
  type PhotoFormState,
} from "@/lib/admin/image-form";
import { getMediaUrl } from "@/lib/media";
import { MAX_ASSOCIATION_PHOTOS } from "@/lib/storage/association-images";
import { cn } from "@/lib/utils";

type PhotoAction = (
  state: PhotoFormState,
  formData: FormData,
) => Promise<PhotoFormState>;

type AssociationPhotosPanelProps = {
  associationName: string;
  photos: AssociationPhoto[];
  canUpload: boolean;
  uploadAction: PhotoAction;
  /** Server actions bound per photo, built by the page. */
  photoActions: Record<
    string,
    {
      update: PhotoAction;
      moveUp: () => Promise<void>;
      moveDown: () => Promise<void>;
      remove: () => Promise<void>;
    }
  >;
};

const initialState: PhotoFormState = { status: "idle", attempt: 0 };

/** The two texts every photo carries, for the upload and edit forms. */
function PhotoTexts({
  idPrefix,
  state,
  defaults,
}: {
  idPrefix: string;
  state: PhotoFormState;
  defaults: { altText: string; caption: string };
}) {
  const values = state.values ?? defaults;
  const errors = state.fieldErrors ?? {};
  const altId = `${idPrefix}-altText`;
  const captionId = `${idPrefix}-caption`;

  return (
    <>
      <Field
        name={captionId}
        label="Pie de foto"
        hint={CAPTION_HINT}
        error={errors.caption}
        optional
      >
        <input
          key={state.attempt}
          id={captionId}
          name="caption"
          type="text"
          maxLength={MAX_CAPTION_LENGTH}
          defaultValue={values.caption}
          aria-invalid={errors.caption ? true : undefined}
          aria-describedby={describedBy(
            captionId,
            CAPTION_HINT,
            errors.caption,
          )}
          className={cn(controlClassName, "min-h-11")}
        />
      </Field>
      <Field
        name={altId}
        label="Texto alternativo"
        hint={ALT_TEXT_HINT}
        error={errors.altText}
        optional
      >
        <textarea
          key={state.attempt}
          id={altId}
          name="altText"
          rows={2}
          maxLength={MAX_ALT_TEXT_LENGTH}
          defaultValue={values.altText}
          aria-invalid={errors.altText ? true : undefined}
          aria-describedby={describedBy(altId, ALT_TEXT_HINT, errors.altText)}
          className={controlClassName}
        />
      </Field>
    </>
  );
}

function PhotoUploadForm({ action }: { action: PhotoAction }) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const { selection, selectFile } = useImageSelection();
  const [selectionError, setSelectionError] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selection.status !== "ready") {
      setSelectionError(
        selection.status === "preparing"
          ? "Espera a que termine de preparar la foto."
          : "Elige una foto para subir.",
      );
      fileInput.current?.focus();
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("file", selection.image.file);
    startTransition(() => formAction(formData));
  }

  const fileError =
    selectionError ??
    (selection.status === "error" ? selection.message : undefined) ??
    state.fieldErrors?.file;
  const fileHint = undefined;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-2xl space-y-6 border-t pt-6"
    >
      <h3 className="font-heading text-lg font-semibold">Agregar una foto</h3>
      <FormAlert message={state.message} />
      <Field name="photo-file" label="Foto" hint={fileHint} error={fileError}>
        <div className="grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
          <label
            htmlFor="photo-file"
            className="bg-muted relative flex aspect-4/3 w-full cursor-pointer items-center justify-center overflow-hidden rounded-sm border"
          >
            {selection.status === "ready" ? (
              // A local preview: next/image cannot optimize blob URLs.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selection.previewUrl}
                alt="Vista previa de la foto elegida"
                className="h-full w-full object-cover"
              />
            ) : selection.status === "preparing" ? (
              <LoaderCircle
                aria-hidden
                className="text-muted-foreground size-6 animate-spin"
              />
            ) : (
              <ImagePlus aria-hidden className="text-muted-foreground size-8" />
            )}
          </label>
          <div className="space-y-2">
            <input
              ref={fileInput}
              id="photo-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              aria-invalid={fileError ? true : undefined}
              aria-describedby={describedBy("photo-file", fileHint, fileError)}
              onChange={(event) => {
                setSelectionError(undefined);
                void selectFile(event.target.files?.[0]);
              }}
              className="peer sr-only"
            />
            <label
              htmlFor="photo-file"
              className={buttonVariants({
                variant: "outline",
                className:
                  "peer-focus-visible:outline-ring w-full cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 sm:w-auto",
              })}
            >
              <ImagePlus aria-hidden />
              {selection.status === "ready" ? "Cambiar foto" : "Elegir foto"}
            </label>
            <p aria-live="polite" className="text-muted-foreground text-sm">
              {selection.status === "preparing"
                ? "Preparando la foto…"
                : selection.status === "ready"
                  ? `Lista para subir · ${selection.image.width} × ${selection.image.height} px · ${formatFileSize(selection.image.file.size)}`
                  : null}
            </p>
          </div>
        </div>
      </Field>
      <PhotoTexts
        idPrefix="nueva"
        state={state}
        defaults={{ altText: "", caption: "" }}
      />
      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Subiendo…" : "Subir foto"}
      </Button>
    </form>
  );
}

function PhotoEditForm({
  photo,
  index,
  action,
}: {
  photo: AssociationPhoto;
  index: number;
  action: PhotoAction;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} noValidate className="space-y-4">
      <FormAlert message={state.message} />
      <PhotoTexts
        idPrefix={`foto-${index + 1}`}
        state={state}
        defaults={{
          altText: photo.altText ?? "",
          caption: photo.caption ?? "",
        }}
      />
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? "Guardando…" : "Guardar textos"}
        <span className="sr-only"> de la foto {index + 1}</span>
      </Button>
    </form>
  );
}

/**
 * An association's profile photos: each with its preview, caption and alt
 * text, moves and removal, then the form to add one, up to the maximum.
 */
function AssociationPhotosPanel({
  associationName,
  photos,
  canUpload,
  uploadAction,
  photoActions,
}: AssociationPhotosPanelProps) {
  const isFull = photos.length >= MAX_ASSOCIATION_PHOTOS;

  return (
    <div className="space-y-8">
      {canUpload ? null : (
        <AdminNotice tone="warning">
          La subida de imágenes aún no está configurada. Avísale a la
          administración de la alianza.
        </AdminNotice>
      )}

      {photos.length > 0 ? (
        <ol aria-label="Fotos de la asociación" className="space-y-4">
          {photos.map((photo, index) => {
            const actions = photoActions[photo.id];
            const url = getMediaUrl(photo.objectKey);
            const label = `foto ${index + 1}`;
            return (
              <li key={photo.id} className="border-t pt-4">
                <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
                  <div className="bg-muted relative aspect-4/3 overflow-hidden rounded-sm border">
                    {url ? (
                      <ImageZoom
                        src={url}
                        alt={photo.altText ?? `Foto de ${associationName}`}
                        label={`Ver la ${label} completa`}
                        className="h-full"
                      >
                        <Image
                          src={url}
                          alt={photo.altText ?? `Foto de ${associationName}`}
                          fill
                          sizes="8rem"
                          className="object-cover"
                        />
                      </ImageZoom>
                    ) : null}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-muted-foreground text-sm">
                      {index === 0 ? "Foto principal" : `Foto ${index + 1}`}
                    </p>
                    <p
                      className={
                        photo.caption ? "font-bold" : "text-muted-foreground"
                      }
                    >
                      {photo.caption ?? "Sin pie de foto"}
                    </p>
                    <div className="-ml-3 flex flex-wrap items-center">
                      <form action={actions.moveUp}>
                        <SubmitButton
                          variant="ghost"
                          size="icon"
                          disabled={index === 0}
                          aria-label={`Mover la ${label} antes`}
                        >
                          <ArrowLeft aria-hidden />
                        </SubmitButton>
                      </form>
                      <form action={actions.moveDown}>
                        <SubmitButton
                          variant="ghost"
                          size="icon"
                          disabled={index === photos.length - 1}
                          aria-label={`Mover la ${label} después`}
                        >
                          <ArrowRight aria-hidden />
                        </SubmitButton>
                      </form>
                      <ConfirmActionButton
                        trigger={
                          <>
                            <Trash2 aria-hidden />
                            Quitar
                            <span className="sr-only"> la {label}</span>
                          </>
                        }
                        triggerVariant="ghost"
                        triggerClassName="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="¿Quitar esta foto?"
                        description="Se borrará de forma definitiva y dejará de verse en el perfil público."
                        confirmLabel="Quitar foto"
                        pendingLabel="Quitando…"
                        tone="destructive"
                        action={actions.remove}
                      />
                    </div>
                    {/* The texts open on demand: most visits only reorder. */}
                    <details className="group/textos">
                      <summary className="text-primary inline-flex min-h-11 cursor-pointer list-none items-center font-bold underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
                        <span className="group-open/textos:hidden">
                          Editar textos
                        </span>
                        <span className="hidden group-open/textos:inline">
                          Cerrar textos
                        </span>
                        <span className="sr-only"> de la {label}</span>
                      </summary>
                      <div className="pt-2">
                        <PhotoEditForm
                          key={`${photo.altText}|${photo.caption}`}
                          photo={photo}
                          index={index}
                          action={actions.update}
                        />
                      </div>
                    </details>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-muted-foreground text-sm">
          Aún no hay fotos. Las del trabajo y el territorio hacen que el perfil
          se entienda mejor.
        </p>
      )}

      {canUpload ? (
        isFull ? (
          <p className="text-muted-foreground text-sm">
            Llegaste al máximo de {MAX_ASSOCIATION_PHOTOS} fotos. Quita una para
            agregar otra.
          </p>
        ) : (
          <div className="space-y-2">
            <PhotoUploadForm key={photos.length} action={uploadAction} />
            <p className="text-muted-foreground text-sm">
              {photos.length} de {MAX_ASSOCIATION_PHOTOS} fotos.
            </p>
          </div>
        )
      ) : null}
    </div>
  );
}

export { AssociationPhotosPanel };
