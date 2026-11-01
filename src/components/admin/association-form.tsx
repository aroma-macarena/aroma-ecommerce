"use client";

import { useActionState, useEffect } from "react";

import {
  controlClassName,
  describedBy,
  Field,
  FormActions,
  FormAlert,
} from "@/components/admin/form-fields";
import type { AssociationFormState } from "@/lib/admin/associations";
import { cn } from "@/lib/utils";

type AssociationFormProps = {
  action: (
    state: AssociationFormState,
    formData: FormData,
  ) => Promise<AssociationFormState>;
  cancelHref: string;
  submitLabel: string;
  defaultValues?: { name: string; location: string };
};

const initialState: AssociationFormState = { status: "idle", attempt: 0 };

const hints = {
  name: "El nombre completo, como aparecerá en la vitrina. Hasta 200 caracteres.",
  newName:
    "El nombre completo, como aparecerá en la vitrina. Su dirección pública se genera con él y no cambia después. Hasta 200 caracteres.",
  location: "Vereda, municipio o departamento. Hasta 255 caracteres.",
};

function AssociationForm({
  action,
  cancelHref,
  submitLabel,
  defaultValues = { name: "", location: "" },
}: AssociationFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const values = state.values ?? defaultValues;
  const nameHint = defaultValues.name ? hints.name : hints.newName;
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    const firstInvalid = (["name", "location"] as const).find(
      (field) => errors[field],
    );

    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
    }
    // Runs once per failed submission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.attempt]);

  return (
    // The key remounts the fields after each failed submission, so they show
    // the submitted values instead of the ones React resets them to.
    <form
      key={state.attempt}
      action={formAction}
      noValidate
      className="space-y-8"
    >
      <FormAlert message={state.message} />

      <div className="max-w-2xl space-y-6">
        <Field name="name" label="Nombre" hint={nameHint} error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={200}
            autoComplete="off"
            defaultValue={values.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name", nameHint, errors.name)}
            className={cn(controlClassName, "min-h-11")}
          />
        </Field>

        <Field
          name="location"
          label="Ubicación"
          hint={hints.location}
          error={errors.location}
          optional
        >
          <input
            id="location"
            name="location"
            type="text"
            maxLength={255}
            defaultValue={values.location}
            aria-invalid={errors.location ? true : undefined}
            aria-describedby={describedBy(
              "location",
              hints.location,
              errors.location,
            )}
            className={cn(controlClassName, "min-h-11")}
          />
        </Field>
      </div>

      <FormActions
        cancelHref={cancelHref}
        submitLabel={submitLabel}
        isPending={isPending}
      />
    </form>
  );
}

export { AssociationForm };
