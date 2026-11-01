"use client";

import { useActionState, useEffect } from "react";

import {
  controlClassName,
  describedBy,
  Field,
  FormActions,
  FormAlert,
  FormSection,
  SelectControl,
} from "@/components/admin/form-fields";
import {
  type ProductFormField,
  productFormFields,
  type ProductFormState,
  type ProductFormValues,
} from "@/lib/admin/product-form";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string; isActive?: boolean };

type ProductFormProps = {
  action: (
    state: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  defaultValues?: ProductFormValues;
  categoryOptions: Option[];
  /** Only for a super administrator creating a product. */
  associationOptions?: Option[];
  submitLabel: string;
  cancelHref: string;
};

const initialState: ProductFormState = { status: "idle", attempt: 0 };

function ProductForm({
  action,
  defaultValues = {},
  categoryOptions,
  associationOptions,
  submitLabel,
  cancelHref,
}: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const values = state.values ?? defaultValues;
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    const firstInvalid = productFormFields.find((field) => errors[field]);

    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
    }
    // Runs once per failed submission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.attempt]);

  function textProps(name: ProductFormField, maxLength: number, hint?: string) {
    return {
      id: name,
      name,
      maxLength,
      defaultValue: values[name] ?? "",
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": describedBy(name, hint, errors[name]),
    };
  }

  const hints = {
    associationId: "No se puede cambiar después de crear el producto.",
    name: "Así aparecerá en la vitrina. Hasta 200 caracteres.",
    shortDescription: "Una o dos frases para la ficha. Hasta 500 caracteres.",
    description: "Hasta 5000 caracteres.",
    origin: "Vereda, municipio o finca. Hasta 255 caracteres.",
    ingredients: "Hasta 2000 caracteres.",
    availabilityNote:
      "Por ejemplo: «Disponible por temporada» o «Bajo pedido». Hasta 500 caracteres.",
  };

  return (
    // The key remounts the fields after each failed submission, so they show
    // the submitted values instead of the ones React resets them to.
    <form
      key={state.attempt}
      action={formAction}
      noValidate
      className="space-y-10"
    >
      <FormAlert message={state.message} />

      <FormSection
        title="Información básica"
        description="Lo que identifica al producto en la vitrina."
      >
        {associationOptions ? (
          <Field
            name="associationId"
            label="Asociación"
            hint={hints.associationId}
            error={errors.associationId}
          >
            <SelectControl
              id="associationId"
              name="associationId"
              required
              defaultValue={values.associationId ?? ""}
              aria-invalid={errors.associationId ? true : undefined}
              aria-describedby={describedBy(
                "associationId",
                hints.associationId,
                errors.associationId,
              )}
            >
              <option value="" disabled>
                Elige una asociación
              </option>
              {associationOptions.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </SelectControl>
          </Field>
        ) : null}

        <Field name="name" label="Nombre" hint={hints.name} error={errors.name}>
          <input
            {...textProps("name", 200, hints.name)}
            type="text"
            required
            autoComplete="off"
            className={cn(controlClassName, "min-h-11")}
          />
        </Field>

        <Field name="categoryId" label="Categoría" error={errors.categoryId}>
          <SelectControl
            id="categoryId"
            name="categoryId"
            required
            defaultValue={values.categoryId ?? ""}
            aria-invalid={errors.categoryId ? true : undefined}
            aria-describedby={describedBy(
              "categoryId",
              undefined,
              errors.categoryId,
            )}
          >
            <option value="" disabled>
              Elige una categoría
            </option>
            {categoryOptions.map(({ id, name, isActive }) => (
              <option key={id} value={id}>
                {isActive === false ? `${name} (inactiva)` : name}
              </option>
            ))}
          </SelectControl>
        </Field>

        <Field
          name="shortDescription"
          label="Descripción corta"
          hint={hints.shortDescription}
          error={errors.shortDescription}
          optional
        >
          <textarea
            {...textProps("shortDescription", 500, hints.shortDescription)}
            rows={2}
            className={controlClassName}
          />
        </Field>
      </FormSection>

      <FormSection
        title="Detalles"
        description="Lo que un comprador quiere saber antes de pedirlo."
      >
        <Field
          name="description"
          label="Descripción"
          hint={hints.description}
          error={errors.description}
          optional
        >
          <textarea
            {...textProps("description", 5000, hints.description)}
            rows={6}
            className={controlClassName}
          />
        </Field>

        <Field
          name="origin"
          label="Origen"
          hint={hints.origin}
          error={errors.origin}
          optional
        >
          <input
            {...textProps("origin", 255, hints.origin)}
            type="text"
            className={cn(controlClassName, "min-h-11")}
          />
        </Field>

        <Field
          name="ingredients"
          label="Ingredientes"
          hint={hints.ingredients}
          error={errors.ingredients}
          optional
        >
          <textarea
            {...textProps("ingredients", 2000, hints.ingredients)}
            rows={3}
            className={controlClassName}
          />
        </Field>

        <Field
          name="availabilityNote"
          label="Nota de disponibilidad"
          hint={hints.availabilityNote}
          error={errors.availabilityNote}
          optional
        >
          <input
            {...textProps("availabilityNote", 500, hints.availabilityNote)}
            type="text"
            className={cn(controlClassName, "min-h-11")}
          />
        </Field>
      </FormSection>

      <FormActions
        cancelHref={cancelHref}
        submitLabel={submitLabel}
        isPending={isPending}
      />
    </form>
  );
}

export { ProductForm };
