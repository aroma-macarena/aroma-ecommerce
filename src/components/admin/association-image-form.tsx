"use client";

import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { type FormEvent, startTransition, useActionState } from "react";

import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { FormAlert } from "@/components/admin/form-fields";
import {
  formatFileSize,
  useImageSelection,
} from "@/components/admin/use-image-selection";
import { AromaLogo } from "@/components/brand/aroma-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import type { AssociationImageFormState } from "@/lib/admin/association-profile-form";
import type { AssociationImageKind } from "@/lib/storage/association-images";
import { ASSOCIATION_IMAGE_MAX_DIMENSION } from "@/lib/storage/association-images";
import { cn } from "@/lib/utils";

type AssociationImageFormProps = {
  kind: AssociationImageKind;
  associationName: string;
  currentUrl: string | null;
  canUpload: boolean;
  uploadAction: (
    state: AssociationImageFormState,
    formData: FormData,
  ) => Promise<AssociationImageFormState>;
  removeAction: () => Promise<void>;
};

const initialState: AssociationImageFormState = { status: "idle", attempt: 0 };

const copy = {
  logo: {
    noun: "logo",
    hint: "JPG, PNG o WebP. Mejor cuadrado y con fondo transparente o claro. Lo reducimos a 800 px y quitamos sus metadatos.",
    empty: "Sin logo: el directorio muestra el símbolo de AROMA.",
    save: "Guardar logo",
    remove: "Quitar logo",
  },
  cover: {
    noun: "portada",
    hint: "JPG, PNG o WebP, horizontal. Una foto real del territorio o del trabajo de la asociación. La reducimos a 2400 px y quitamos sus metadatos.",
    empty: "Sin portada: el perfil empieza directamente con el nombre.",
    save: "Guardar portada",
    remove: "Quitar portada",
  },
} as const;

function AssociationImageForm({
  kind,
  associationName,
  currentUrl,
  canUpload,
  uploadAction,
  removeAction,
}: AssociationImageFormProps) {
  const [state, formAction, isPending] = useActionState(
    uploadAction,
    initialState,
  );
  const { selection, selectFile } = useImageSelection(
    ASSOCIATION_IMAGE_MAX_DIMENSION[kind],
  );
  const text = copy[kind];
  const inputId = `${kind}-file`;
  const previewUrl =
    selection.status === "ready" ? selection.previewUrl : currentUrl;
  const error =
    selection.status === "error" ? selection.message : state.message;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selection.status !== "ready") {
      return;
    }

    const formData = new FormData();
    formData.set("file", selection.image.file);
    startTransition(() => formAction(formData));
  }

  return (
    // The remove button stays outside the upload form: React would carry its
    // dialog's submit up to this form, whose handler cancels it.
    <div className="space-y-4">
      <div
        className={cn(
          "bg-muted relative flex items-center justify-center overflow-hidden rounded-sm border",
          kind === "logo"
            ? "bg-card aspect-square w-32"
            : "aspect-[21/8] w-full",
        )}
      >
        {selection.status === "preparing" ? (
          <LoaderCircle
            aria-hidden
            className="text-muted-foreground size-6 animate-spin"
          />
        ) : previewUrl ? (
          selection.status === "ready" ? (
            // A local preview: next/image cannot optimize blob URLs.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={`Vista previa del nuevo ${text.noun}`}
              className={cn(
                "h-full w-full",
                kind === "logo" ? "object-contain p-2" : "object-cover",
              )}
            />
          ) : (
            <Image
              src={previewUrl}
              alt={
                kind === "logo"
                  ? `Logo de ${associationName}`
                  : `Portada actual de ${associationName}`
              }
              fill
              sizes={
                kind === "logo" ? "8rem" : "(min-width: 768px) 42rem, 100vw"
              }
              className={
                kind === "logo" ? "object-contain p-2" : "object-cover"
              }
            />
          )
        ) : kind === "logo" ? (
          <AromaLogo variant="symbol" className="w-3/5 opacity-35 grayscale" />
        ) : (
          <ImagePlus aria-hidden className="text-muted-foreground size-8" />
        )}
      </div>

      {currentUrl || selection.status === "ready" ? null : (
        <p className="text-muted-foreground text-sm">{text.empty}</p>
      )}

      <FormAlert message={error} />

      {canUpload ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <form onSubmit={handleSubmit} noValidate className="contents">
              <input
                id={inputId}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                aria-describedby={`${inputId}-ayuda`}
                onChange={(event) => void selectFile(event.target.files?.[0])}
                className="peer sr-only"
              />
              <label
                htmlFor={inputId}
                className={buttonVariants({
                  variant: "outline",
                  className:
                    "peer-focus-visible:outline-ring w-full cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 sm:w-auto",
                })}
              >
                <ImagePlus aria-hidden />
                {currentUrl || selection.status === "ready"
                  ? "Cambiar imagen"
                  : "Elegir imagen"}
              </label>

              {selection.status === "ready" ? (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto"
                >
                  {isPending ? "Subiendo…" : text.save}
                </Button>
              ) : null}
            </form>
            {selection.status !== "ready" && currentUrl ? (
              <ConfirmActionButton
                trigger={
                  <>
                    <Trash2 aria-hidden />
                    {text.remove}
                  </>
                }
                triggerVariant="ghost"
                triggerClassName="text-destructive hover:bg-destructive/10 hover:text-destructive w-full sm:w-auto"
                title={`¿${text.remove}?`}
                description={`Se borrará de forma definitiva. ${text.empty}`}
                confirmLabel={text.remove}
                pendingLabel="Quitando…"
                tone="destructive"
                action={removeAction}
              />
            ) : null}
          </div>
          <p
            aria-live="polite"
            className="text-muted-foreground font-mono text-xs"
          >
            {selection.status === "preparing"
              ? "Preparando la imagen…"
              : selection.status === "ready"
                ? `Lista para subir · ${selection.image.width} × ${selection.image.height} px · ${formatFileSize(selection.image.file.size)}`
                : null}
          </p>
          <p id={`${inputId}-ayuda`} className="text-muted-foreground text-sm">
            {text.hint}
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          La subida de imágenes aún no está configurada. Avísale a la
          administración de la alianza.
        </p>
      )}
    </div>
  );
}

export { AssociationImageForm };
