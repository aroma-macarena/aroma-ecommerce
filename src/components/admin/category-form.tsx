"use client";

import { type ReactNode, useActionState, useEffect } from "react";

import {
  controlClassName,
  describedBy,
  Field,
  FormActions,
  FormAlert,
} from "@/components/admin/form-fields";
import type { CategoryFormState } from "@/lib/admin/categories";
import { cn } from "@/lib/utils";

type CategoryFormProps = {
  action: (
    state: CategoryFormState,
    formData: FormData,
  ) => Promise<CategoryFormState>;
  cancelHref: string;
  submitLabel: string;
  defaultValues?: { name: string; description: string };
  secondaryAction?: ReactNode;
  actionsNote?: ReactNode;
};

const initialState: CategoryFormState = { status: "idle", attempt: 0 };

const hints = {
  name: "Como aparecerá en el filtro de la vitrina y en las fichas. Hasta 100 caracteres.",
  newName:
    "Como aparecerá en el filtro de la vitrina y en las fichas. Su dirección en el filtro se genera con él y no cambia después. Hasta 100 caracteres.",
  description:
    "Para orientar a las asociaciones al elegirla. Hasta 500 caracteres.",
};

function CategoryForm({
  action,
  cancelHref,
  submitLabel,
  defaultValues = { name: "", description: "" },
  secondaryAction,
  actionsNote,
}: CategoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const values = state.values ?? defaultValues;
  const errors = state.fieldErrors ?? {};
  const nameHint = defaultValues.name ? hints.name : hints.newName;

  useEffect(() => {
    const firstInvalid = (["name", "description"] as const).find(
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
            maxLength={100}
            autoComplete="off"
            defaultValue={values.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name", nameHint, errors.name)}
            className={cn(controlClassName, "min-h-11")}
          />
        </Field>

        <Field
          name="description"
          label="Descripción"
          hint={hints.description}
          error={errors.description}
          optional
        >
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            defaultValue={values.description}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={describedBy(
              "description",
              hints.description,
              errors.description,
            )}
            className={controlClassName}
          />
        </Field>
      </div>

      <FormActions
        cancelHref={cancelHref}
        submitLabel={submitLabel}
        isPending={isPending}
        secondaryAction={secondaryAction}
        note={actionsNote}
      />
    </form>
  );
}

export { CategoryForm };
