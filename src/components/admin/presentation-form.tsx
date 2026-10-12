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
  presentationFormFields,
  type PresentationFormState,
  type PresentationFormValues,
} from "@/lib/admin/presentation-form";
import { cn } from "@/lib/utils";

type PresentationFormProps = {
  action: (
    state: PresentationFormState,
    formData: FormData,
  ) => Promise<PresentationFormState>;
  defaultValues?: PresentationFormValues;
  submitLabel: string;
  cancelHref: string;
  secondaryAction?: ReactNode;
  actionsNote?: ReactNode;
};

const initialState: PresentationFormState = { status: "idle", attempt: 0 };

const unitSuggestions = [
  "g",
  "kg",
  "ml",
  "L",
  "lb",
  "unidad",
  "unidades",
  "bolsa",
  "frasco",
  "botella",
  "paquete",
  "caja",
];

const hints = {
  name: "Como la verá el comprador, por ejemplo «Bolsa 250 g». Hasta 150 caracteres.",
  quantity: "Por ejemplo: 250 o 1,5.",
  unit: "Por ejemplo: g, kg, ml o unidad.",
  referencePrice:
    "En pesos colombianos, sin centavos. Es una referencia para el comprador.",
  isAvailable:
    "Solo las presentaciones disponibles cuentan para publicar el producto.",
};

function PresentationForm({
  action,
  defaultValues = { isAvailable: "on" },
  submitLabel,
  cancelHref,
  secondaryAction,
  actionsNote,
}: PresentationFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const values = state.values ?? defaultValues;
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    const firstInvalid = presentationFormFields.find((field) => errors[field]);

    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
    }
    // Runs once per failed submission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.attempt]);

  function inputProps(
    name: "name" | "quantity" | "unit" | "referencePrice",
    maxLength: number,
  ) {
    return {
      id: name,
      name,
      maxLength,
      defaultValue: values[name] ?? "",
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": describedBy(name, hints[name], errors[name]),
      className: cn(controlClassName, "min-h-11"),
    };
  }

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
        <Field name="name" label="Nombre" hint={hints.name} error={errors.name}>
          <input
            {...inputProps("name", 150)}
            type="text"
            required
            autoComplete="off"
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            name="quantity"
            label="Cantidad"
            hint={hints.quantity}
            error={errors.quantity}
            optional
          >
            <input
              {...inputProps("quantity", 16)}
              type="text"
              inputMode="decimal"
              autoComplete="off"
            />
          </Field>

          <Field
            name="unit"
            label="Unidad"
            hint={hints.unit}
            error={errors.unit}
            optional
          >
            <input
              {...inputProps("unit", 50)}
              type="text"
              list="unidades-sugeridas"
              autoComplete="off"
            />
            <datalist id="unidades-sugeridas">
              {unitSuggestions.map((unit) => (
                <option key={unit} value={unit} />
              ))}
            </datalist>
          </Field>
        </div>

        <Field
          name="referencePrice"
          label="Precio de referencia"
          hint={hints.referencePrice}
          error={errors.referencePrice}
          optional
        >
          <div className="relative">
            <span
              aria-hidden
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            >
              $
            </span>
            <input
              {...inputProps("referencePrice", 20)}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className={cn(controlClassName, "min-h-11 pl-7")}
            />
          </div>
        </Field>

        <div className="space-y-1.5">
          <div className="flex items-start gap-3">
            <input
              id="isAvailable"
              name="isAvailable"
              type="checkbox"
              defaultChecked={values.isAvailable === "on"}
              aria-invalid={errors.isAvailable ? true : undefined}
              aria-describedby={describedBy(
                "isAvailable",
                hints.isAvailable,
                errors.isAvailable,
              )}
              className="accent-primary focus-visible:outline-ring mt-0.5 size-5 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
            />
            <label htmlFor="isAvailable" className="font-medium">
              Disponible
            </label>
          </div>
          <p
            id="isAvailable-ayuda"
            className="text-muted-foreground pl-8 text-sm"
          >
            {hints.isAvailable}
          </p>
          {errors.isAvailable ? (
            <p
              id="isAvailable-error"
              className="text-destructive pl-8 text-sm font-medium"
            >
              {errors.isAvailable}
            </p>
          ) : null}
        </div>
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

export { PresentationForm };
