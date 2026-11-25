"use client";

import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { type FormEvent, startTransition, useActionState } from "react";

import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { FormAlert } from "@/components/admin/form-fields";
import { ImageZoom } from "@/components/admin/image-zoom";
import {
  formatFileSize,
  useImageSelection,
} from "@/components/admin/use-image-selection";
import { AromaLogo } from "@/components/brand/aroma-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import type { SingleImageFormState } from "@/lib/admin/image-form";
import { ASSOCIATION_IMAGE_MAX_DIMENSION } from "@/lib/storage/association-images";
import { PRODUCT_BANNER_MAX_DIMENSION } from "@/lib/storage/product-images";
import { cn } from "@/lib/utils";

/** An association's logo or cover, or a product's home banner. */
export type ImageFieldKind = "logo" | "cover" | "banner";

type ImageFieldFormProps = {
  kind: ImageFieldKind;
  /** The association or product the image belongs to, for its alt text. */
  ownerName: string;
  currentUrl: string | null;
  canUpload: boolean;
  uploadAction: (
    state: SingleImageFormState,
    formData: FormData,
  ) => Promise<SingleImageFormState>;
  removeAction: () => Promise<void>;
};

const initialState: SingleImageFormState = { status: "idle", attempt: 0 };

const maxDimension: Record<ImageFieldKind, number> = {
  ...ASSOCIATION_IMAGE_MAX_DIMENSION,
  banner: PRODUCT_BANNER_MAX_DIMENSION,
};

const copy = {
  logo: {
    noun: "logo",
    hint: "",
    empty: "",
    save: "Guardar logo",
    remove: "Quitar logo",
  },
  cover: {
    noun: "portada",
    hint: "Horizontal.",
    empty: "Sin portada: el perfil empieza directamente con el nombre.",
    save: "Guardar portada",
    remove: "Quitar portada",
  },
  banner: {
    noun: "foto",
    hint: "Horizontal, mejor 16:9. Deja el producto al centro: los bordes se recortan.",
    empty: "Sin foto para el inicio, se usa la principal recortada.",
    save: "Guardar foto",
    remove: "Quitar foto",
  },
} as const;

/** How the home's featured carousel crops a banner, shown in its preview. */
const bannerCrops = [
  { label: "En computador", className: "aspect-[15/7]" },
  { label: "En celular", className: "aspect-4/3" },
] as const;

function ImageFieldForm({
  kind,
  ownerName,
  currentUrl,
  canUpload,
  uploadAction,
  removeAction,
}: ImageFieldFormProps) {
  const [state, formAction, isPending] = useActionState(
    uploadAction,
    initialState,
  );
  const { selection, selectFile } = useImageSelection(maxDimension[kind]);
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
          // An empty wide slot is only grey space: the line below says it.
          kind !== "logo" &&
            !previewUrl &&
            selection.status !== "preparing" &&
            "hidden",
          kind === "logo"
            ? "bg-card aspect-square w-32"
            : kind === "cover"
              ? "aspect-[21/8] w-full"
              : "aspect-video w-full max-w-xl",
        )}
      >
        {selection.status === "preparing" ? (
          <LoaderCircle
            aria-hidden
            className="text-muted-foreground size-6 animate-spin"
          />
        ) : previewUrl ? (
          <ImageZoom
            src={previewUrl}
            alt={
              kind === "logo"
                ? `Logo de ${ownerName}`
                : kind === "cover"
                  ? `Portada de ${ownerName}`
                  : `Foto de ${ownerName} para el inicio`
            }
            label={
              kind === "logo"
                ? "Ver el logo completo"
                : kind === "cover"
                  ? "Ver la portada completa"
                  : "Ver la foto completa"
            }
            className="h-full"
          >
            {selection.status === "ready" ? (
              // A local preview: next/image cannot optimize blob URLs.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={`Vista previa de ${kind === "banner" ? "la nueva" : "el nuevo"} ${text.noun}`}
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
                    ? `Logo de ${ownerName}`
                    : kind === "cover"
                      ? `Portada actual de ${ownerName}`
                      : `Foto actual de ${ownerName} para el inicio`
                }
                fill
                sizes={
                  kind === "logo" ? "8rem" : "(min-width: 768px) 42rem, 100vw"
                }
                className={
                  kind === "logo" ? "object-contain p-2" : "object-cover"
                }
              />
            )}
          </ImageZoom>
        ) : kind === "logo" ? (
          <AromaLogo variant="symbol" className="w-3/5 opacity-35 grayscale" />
        ) : (
          <ImagePlus aria-hidden className="text-muted-foreground size-8" />
        )}
      </div>

      {kind === "banner" && previewUrl && selection.status !== "preparing" ? (
        <div className="grid max-w-xl grid-cols-[1.6fr_1fr] gap-3">
          {bannerCrops.map(({ label, className }) => (
            <figure key={label} className="space-y-1.5">
              <div
                className={cn(
                  "bg-muted relative overflow-hidden rounded-sm border",
                  className,
                )}
              >
                {/* Same image as above, cropped like the home does. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="text-muted-foreground text-xs">
                {label}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      {/* The banner's section description already says it is optional. */}
      {currentUrl ||
      selection.status === "ready" ||
      !text.empty ||
      kind === "banner" ? null : (
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
                aria-describedby={text.hint ? `${inputId}-ayuda` : undefined}
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
                description={`Se borrará de forma definitiva. ${text.empty}`.trim()}
                confirmLabel={text.remove}
                pendingLabel="Quitando…"
                tone="destructive"
                action={removeAction}
              />
            ) : null}
          </div>
          <p aria-live="polite" className="text-muted-foreground text-sm">
            {selection.status === "preparing"
              ? "Preparando la imagen…"
              : selection.status === "ready"
                ? `Lista para subir · ${selection.image.width} × ${selection.image.height} px · ${formatFileSize(selection.image.file.size)}`
                : null}
          </p>
          {text.hint ? (
            <p
              id={`${inputId}-ayuda`}
              className="text-muted-foreground text-sm"
            >
              {text.hint}
            </p>
          ) : null}
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

export { ImageFieldForm };
