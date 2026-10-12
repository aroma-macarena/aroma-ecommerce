"use client";

import { ChevronDown, CircleAlert } from "lucide-react";
import Link from "next/link";
import {
  type ComponentProps,
  type ReactNode,
  useActionState,
  useEffect,
} from "react";

import { Button, buttonVariants } from "@/components/ui/button";
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

const controlClassName =
  "border-input bg-card w-full rounded-md border px-3 py-2.5 text-base leading-6 transition-colors placeholder:text-muted-foreground/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-destructive";

function describedBy(name: ProductFormField, hint?: string, error?: string) {
  return (
    [hint && `${name}-ayuda`, error && `${name}-error`]
      .filter(Boolean)
      .join(" ") || undefined
  );
}

type FieldProps = {
  name: ProductFormField;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
};

function Field({ name, label, hint, error, optional, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="flex items-baseline gap-2 font-medium">
        {label}
        {optional ? (
          <span className="text-muted-foreground font-mono text-[0.6875rem] font-normal tracking-[0.06em] uppercase">
            Opcional
          </span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p id={`${name}-ayuda`} className="text-muted-foreground text-sm">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${name}-error`}
          className="text-destructive flex items-start gap-1.5 text-sm font-medium"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SelectControl(props: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(controlClassName, "min-h-11 appearance-none pr-10")}
      />
      <ChevronDown
        aria-hidden
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
      />
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="border-foreground grid gap-5 border-t pt-5 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10">
      <div className="space-y-1">
        <legend className="font-heading float-left text-xl font-semibold tracking-[-0.015em]">
          {title}
        </legend>
        <p className="text-muted-foreground clear-left text-sm leading-6">
          {description}
        </p>
      </div>
      <div className="max-w-2xl space-y-6">{children}</div>
    </fieldset>
  );
}

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
      {state.message ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 text-destructive flex items-start gap-2 rounded-md border px-4 py-3 text-sm font-medium"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </div>
      ) : null}

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

      <div className="border-foreground flex flex-col-reverse gap-3 border-t-[1.5px] pt-5 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          className={buttonVariants({ variant: "outline" })}
        >
          Cancelar
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export { ProductForm };
