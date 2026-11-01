"use client";

import { useActionState, useEffect } from "react";

import {
  controlClassName,
  describedBy,
  Field,
  FormActions,
  FormAlert,
  FormSection,
} from "@/components/admin/form-fields";
import {
  type AssociationProfileField,
  associationProfileFields,
  type AssociationProfileFormState,
  type AssociationProfileValues,
} from "@/lib/admin/association-profile-form";
import { cn } from "@/lib/utils";

type AssociationProfileFormProps = {
  action: (
    state: AssociationProfileFormState,
    formData: FormData,
  ) => Promise<AssociationProfileFormState>;
  defaultValues: AssociationProfileValues;
  /** Only super administrators rename associations. */
  canEditName: boolean;
  cancelHref: string;
};

const initialState: AssociationProfileFormState = {
  status: "idle",
  attempt: 0,
};

const hints = {
  name: "Como aparece en la vitrina, el directorio y los mensajes. Su dirección pública no cambia. Hasta 200 caracteres.",
  location: "Vereda, municipio o departamento. Hasta 255 caracteres.",
  description:
    "Quiénes son y qué producen, en pocas frases. Aparece en el directorio y en el perfil. Hasta 2000 caracteres.",
  history: "Cómo empezó la asociación y qué la mueve. Hasta 5000 caracteres.",
  whatsappNumber:
    "Celular para el botón «Consultar por WhatsApp». No se muestra el número: se abre el chat. Por ejemplo, 300 111 2233.",
  contactName:
    "Persona que atiende los mensajes. No se publica: es para coordinar con la alianza. Hasta 150 caracteres.",
};

function AssociationProfileForm({
  action,
  defaultValues,
  canEditName,
  cancelHref,
}: AssociationProfileFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const values = state.values ?? defaultValues;
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    const firstInvalid = associationProfileFields.find(
      (field) => errors[field],
    );

    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
    }
    // Runs once per failed submission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.attempt]);

  function inputProps(name: AssociationProfileField, maxLength: number) {
    return {
      id: name,
      name,
      maxLength,
      defaultValue: values[name] ?? "",
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": describedBy(name, hints[name], errors[name]),
    };
  }

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
        title="Información pública"
        description="Lo que el público lee en el directorio y en el perfil."
      >
        {canEditName ? (
          <Field
            name="name"
            label="Nombre"
            hint={hints.name}
            error={errors.name}
          >
            <input
              {...inputProps("name", 200)}
              type="text"
              required
              autoComplete="off"
              className={cn(controlClassName, "min-h-11")}
            />
          </Field>
        ) : (
          <div className="space-y-1.5">
            <p className="font-medium">Nombre</p>
            <p className="wrap-anywhere">{values.name}</p>
            <p className="text-muted-foreground text-sm">
              Para cambiarlo, escríbele a la administración de la alianza.
            </p>
            <input type="hidden" name="name" value={values.name ?? ""} />
          </div>
        )}

        <Field
          name="location"
          label="Ubicación"
          hint={hints.location}
          error={errors.location}
          optional
        >
          <input
            {...inputProps("location", 255)}
            type="text"
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
            {...inputProps("description", 2000)}
            rows={4}
            className={controlClassName}
          />
        </Field>

        <Field
          name="history"
          label="Historia"
          hint={hints.history}
          error={errors.history}
          optional
        >
          <textarea
            {...inputProps("history", 5000)}
            rows={6}
            className={controlClassName}
          />
        </Field>
      </FormSection>

      <FormSection
        title="Contacto"
        description="Cómo los compradores llegan a la asociación."
      >
        <Field
          name="whatsappNumber"
          label="WhatsApp"
          hint={hints.whatsappNumber}
          error={errors.whatsappNumber}
          optional
        >
          <input
            {...inputProps("whatsappNumber", 30)}
            type="tel"
            inputMode="tel"
            autoComplete="off"
            className={cn(controlClassName, "min-h-11")}
          />
        </Field>

        <Field
          name="contactName"
          label="Persona de contacto"
          hint={hints.contactName}
          error={errors.contactName}
          optional
        >
          <input
            {...inputProps("contactName", 150)}
            type="text"
            autoComplete="off"
            className={cn(controlClassName, "min-h-11")}
          />
        </Field>
      </FormSection>

      <FormActions
        cancelHref={cancelHref}
        submitLabel="Guardar cambios"
        isPending={isPending}
      />
    </form>
  );
}

export { AssociationProfileForm };
