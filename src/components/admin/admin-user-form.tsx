"use client";

import { useActionState, useEffect, useState } from "react";

import { adminRoleLabels } from "@/components/admin/admin-navigation";
import {
  controlClassName,
  describedBy,
  Field,
  FormActions,
  FormAlert,
  SelectControl,
} from "@/components/admin/form-fields";
import type {
  AdminUserField,
  AdminUserFieldErrors,
  AdminUserFormState,
  AdminUserFormValues,
  AdminUserRole,
} from "@/lib/admin/admin-user-form";
import { cn } from "@/lib/utils";

type AssociationOption = {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

type AdminUserFormProps = {
  action: (
    state: AdminUserFormState,
    formData: FormData,
  ) => Promise<AdminUserFormState>;
  associations: AssociationOption[];
  /** Saved values when editing; the email is then shown, not edited. */
  initialValues?: AdminUserFormValues;
  /** Editing your own account: the role stays as it is. */
  isSelf?: boolean;
  cancelHref: string;
  submitLabel: string;
  note?: React.ReactNode;
};

const initialState: AdminUserFormState = { status: "idle", attempt: 0 };

const emptyValues: AdminUserFormValues = {
  name: "",
  email: "",
  role: "ASSOCIATION_ADMIN",
  associationId: "",
};

const hints = {
  name: "Como aparecerá en el panel. Hasta 150 caracteres.",
  email:
    "Le enviaremos una invitación para crear su acceso. Si ya tiene una cuenta con este correo, podrá entrar de inmediato.",
  associationId:
    "Solo podrá ver y editar los productos y el perfil de esta asociación.",
};

const roleDescriptions: Record<AdminUserRole, string> = {
  ASSOCIATION_ADMIN:
    "Gestiona los productos y el perfil de una sola asociación.",
  SUPER_ADMIN:
    "Gestiona toda la alianza: asociaciones, categorías, productos y usuarios.",
};

const focusOrder: AdminUserField[] = ["name", "email", "role", "associationId"];

function AdminUserForm({
  action,
  associations,
  initialValues,
  isSelf = false,
  cancelHref,
  submitLabel,
  note,
}: AdminUserFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const values = state.values ?? initialValues ?? emptyValues;
  const errors = state.fieldErrors ?? {};
  // When editing, the email is not submitted, so it comes from the saved
  // values even after a failed submission.
  const savedEmail = initialValues?.email;

  useEffect(() => {
    const firstInvalid = focusOrder.find((field) => errors[field]);

    if (firstInvalid) {
      document
        .getElementById(
          firstInvalid === "role" ? "role-ASSOCIATION_ADMIN" : firstInvalid,
        )
        ?.focus();
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
        <Field name="name" label="Nombre" hint={hints.name} error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={150}
            autoComplete="off"
            defaultValue={values.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name", hints.name, errors.name)}
            className={cn(controlClassName, "min-h-11")}
          />
        </Field>

        {savedEmail !== undefined ? (
          <div className="space-y-1.5">
            <p className="font-medium">Correo</p>
            <p className="wrap-anywhere">{savedEmail}</p>
            <p className="text-muted-foreground text-sm">
              Es el correo de su cuenta de acceso y no se cambia desde aquí.
            </p>
          </div>
        ) : (
          <Field
            name="email"
            label="Correo"
            hint={hints.email}
            error={errors.email}
          >
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={255}
              autoComplete="off"
              spellCheck={false}
              defaultValue={values.email}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy("email", hints.email, errors.email)}
              className={cn(controlClassName, "min-h-11")}
            />
          </Field>
        )}

        <RoleFields
          values={values}
          errors={errors}
          associations={associations}
          isSelf={isSelf}
        />
      </div>

      <FormActions
        cancelHref={cancelHref}
        submitLabel={submitLabel}
        isPending={isPending}
        note={note}
      />
    </form>
  );
}

/**
 * Role and association. The association only applies to association
 * administrators, so it shows when that role is chosen. Part of the keyed
 * form, so a failed submission starts from the submitted role.
 */
function RoleFields({
  values,
  errors,
  associations,
  isSelf,
}: {
  values: AdminUserFormValues;
  errors: AdminUserFieldErrors;
  associations: AssociationOption[];
  isSelf: boolean;
}) {
  const [role, setRole] = useState(values.role);

  return (
    <>
      <fieldset
        className="space-y-3"
        aria-describedby={errors.role ? "role-error" : undefined}
      >
        <legend className="font-medium">Rol</legend>
        {isSelf ? (
          <>
            <input type="hidden" name="role" value={values.role} />
            <p>{adminRoleLabels[values.role as AdminUserRole]}</p>
            <p className="text-muted-foreground text-sm">
              No puedes cambiar tu propio rol. Otra persona con rol de
              superadministrador puede hacerlo.
            </p>
          </>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {(["ASSOCIATION_ADMIN", "SUPER_ADMIN"] as const).map((option) => (
              <label
                key={option}
                htmlFor={`role-${option}`}
                className="has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:outline-ring flex cursor-pointer items-start gap-3 rounded-md border p-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
              >
                <input
                  id={`role-${option}`}
                  type="radio"
                  name="role"
                  value={option}
                  defaultChecked={values.role === option}
                  onChange={() => setRole(option)}
                  className="accent-primary mt-1 size-4 shrink-0"
                />
                <span className="space-y-1">
                  <span className="block font-medium">
                    {adminRoleLabels[option]}
                  </span>
                  <span className="text-muted-foreground block text-sm">
                    {roleDescriptions[option]}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
        {errors.role ? (
          <p id="role-error" className="text-destructive text-sm font-medium">
            {errors.role}
          </p>
        ) : null}
      </fieldset>

      {role === "ASSOCIATION_ADMIN" ? (
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
            defaultValue={values.associationId}
            aria-invalid={errors.associationId ? true : undefined}
            aria-describedby={describedBy(
              "associationId",
              hints.associationId,
              errors.associationId,
            )}
          >
            <option value="">Elige una asociación</option>
            {associations.map((association) => (
              <option key={association.id} value={association.id}>
                {association.name}
                {association.status === "INACTIVE" ? " (inactiva)" : ""}
              </option>
            ))}
          </SelectControl>
        </Field>
      ) : null}
    </>
  );
}

export { AdminUserForm };
