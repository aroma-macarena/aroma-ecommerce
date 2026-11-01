"use client";

import { ImagePlus, LoaderCircle } from "lucide-react";
import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  controlClassName,
  describedBy,
  Field,
  FormActions,
  FormAlert,
} from "@/components/admin/form-fields";
import { buttonVariants } from "@/components/ui/button";
import {
  ALT_TEXT_HINT,
  type ImageFormState,
  MAX_ALT_TEXT_LENGTH,
} from "@/lib/admin/image-form";
import {
  ImageReductionError,
  type ReducedImage,
  reduceImage,
} from "@/lib/image-reduction";

type ImageUploadFormProps = {
  action: (
    state: ImageFormState,
    formData: FormData,
  ) => Promise<ImageFormState>;
  cancelHref: string;
};

type Selection =
  | { status: "empty" }
  | { status: "preparing" }
  | {
      status: "ready";
      image: ReducedImage;
      previewUrl: string;
      sourceName: string;
    }
  | { status: "error"; message: string };

const initialState: ImageFormState = { status: "idle", attempt: 0 };

const reductionMessages = {
  TOO_LARGE: "La foto pesa más de 20 MB. Elige una más liviana.",
  UNREADABLE: "No pudimos leer esta imagen. Usa una foto en JPG, PNG o WebP.",
};

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toLocaleString("es-CO", {
        maximumFractionDigits: 1,
      })} MB`;
}

function ImageUploadForm({ action, cancelHref }: ImageUploadFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [selection, setSelection] = useState<Selection>({ status: "empty" });
  const [selectionError, setSelectionError] = useState<string>();
  const previewUrl = useRef<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (previewUrl.current) {
        URL.revokeObjectURL(previewUrl.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (state.fieldErrors?.file) {
      fileInput.current?.focus();
    } else if (state.fieldErrors?.altText) {
      document.getElementById("altText")?.focus();
    }
  }, [state]);

  async function handleFile(file: File | undefined) {
    setSelectionError(undefined);

    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
    }

    if (!file) {
      setSelection({ status: "empty" });
      return;
    }

    setSelection({ status: "preparing" });

    try {
      const image = await reduceImage(file);
      previewUrl.current = URL.createObjectURL(image.file);
      setSelection({
        status: "ready",
        image,
        previewUrl: previewUrl.current,
        sourceName: file.name,
      });
    } catch (error) {
      const message =
        error instanceof ImageReductionError
          ? reductionMessages[error.code]
          : reductionMessages.UNREADABLE;
      setSelection({ status: "error", message });
    }
  }

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
  const fileHint =
    "JPG, PNG o WebP de hasta 20 MB. La reducimos a 2000 px antes de subirla y quitamos sus metadatos, como la ubicación.";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <FormAlert message={state.message} />

      <div className="max-w-2xl space-y-6">
        <Field name="file" label="Foto" hint={fileHint} error={fileError}>
          <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-start">
            <label
              htmlFor="file"
              className="bg-muted relative flex aspect-4/5 w-full cursor-pointer items-center justify-center overflow-hidden rounded-sm border"
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
                <ImagePlus
                  aria-hidden
                  className="text-muted-foreground size-8"
                />
              )}
            </label>
            <div className="space-y-2">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                <input
                  ref={fileInput}
                  id="file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  aria-invalid={fileError ? true : undefined}
                  aria-describedby={describedBy("file", fileHint, fileError)}
                  onChange={(event) => handleFile(event.target.files?.[0])}
                  className="peer sr-only"
                />
                <label
                  htmlFor="file"
                  className={buttonVariants({
                    variant: "outline",
                    className:
                      "peer-focus-visible:outline-ring peer-aria-invalid:border-destructive w-full cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 sm:w-auto",
                  })}
                >
                  <ImagePlus aria-hidden />
                  {selection.status === "ready"
                    ? "Cambiar foto"
                    : "Elegir foto"}
                </label>
                {selection.status === "ready" ? (
                  <span className="text-muted-foreground min-w-0 truncate text-sm">
                    {selection.sourceName}
                  </span>
                ) : null}
              </div>
              <p
                aria-live="polite"
                className="text-muted-foreground font-mono text-xs"
              >
                {selection.status === "preparing"
                  ? "Preparando la foto…"
                  : selection.status === "ready"
                    ? `Lista para subir · ${selection.image.width} × ${selection.image.height} px · ${formatSize(selection.image.file.size)}`
                    : null}
              </p>
            </div>
          </div>
        </Field>

        <Field
          name="altText"
          label="Texto alternativo"
          hint={ALT_TEXT_HINT}
          error={state.fieldErrors?.altText}
          optional
        >
          <textarea
            key={state.attempt}
            id="altText"
            name="altText"
            rows={2}
            maxLength={MAX_ALT_TEXT_LENGTH}
            defaultValue={state.values?.altText ?? ""}
            aria-invalid={state.fieldErrors?.altText ? true : undefined}
            aria-describedby={describedBy(
              "altText",
              ALT_TEXT_HINT,
              state.fieldErrors?.altText,
            )}
            className={controlClassName}
          />
        </Field>
      </div>

      <FormActions
        cancelHref={cancelHref}
        submitLabel="Subir imagen"
        isPending={isPending}
      />
    </form>
  );
}

export { ImageUploadForm };
