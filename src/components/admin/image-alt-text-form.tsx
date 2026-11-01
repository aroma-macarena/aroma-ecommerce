"use client";

import { type ReactNode, useActionState, useEffect } from "react";

import {
  controlClassName,
  describedBy,
  Field,
  FormActions,
  FormAlert,
} from "@/components/admin/form-fields";
import {
  ALT_TEXT_HINT,
  type ImageFormState,
  MAX_ALT_TEXT_LENGTH,
} from "@/lib/admin/image-form";

type ImageAltTextFormProps = {
  action: (
    state: ImageFormState,
    formData: FormData,
  ) => Promise<ImageFormState>;
  defaultAltText: string;
  cancelHref: string;
  secondaryAction?: ReactNode;
};

const initialState: ImageFormState = { status: "idle", attempt: 0 };

function ImageAltTextForm({
  action,
  defaultAltText,
  cancelHref,
  secondaryAction,
}: ImageAltTextFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const error = state.fieldErrors?.altText;

  useEffect(() => {
    if (error) {
      document.getElementById("altText")?.focus();
    }
  }, [state.attempt, error]);

  return (
    <form
      key={state.attempt}
      action={formAction}
      noValidate
      className="space-y-8"
    >
      <FormAlert message={state.message} />

      <div className="max-w-2xl">
        <Field
          name="altText"
          label="Texto alternativo"
          hint={ALT_TEXT_HINT}
          error={error}
          optional
        >
          <textarea
            id="altText"
            name="altText"
            rows={3}
            maxLength={MAX_ALT_TEXT_LENGTH}
            defaultValue={state.values?.altText ?? defaultAltText}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy("altText", ALT_TEXT_HINT, error)}
            className={controlClassName}
          />
        </Field>
      </div>

      <FormActions
        cancelHref={cancelHref}
        submitLabel="Guardar cambios"
        isPending={isPending}
        secondaryAction={secondaryAction}
      />
    </form>
  );
}

export { ImageAltTextForm };
