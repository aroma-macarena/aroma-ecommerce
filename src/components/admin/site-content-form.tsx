"use client";

import { useActionState, useEffect } from "react";

import {
  controlClassName,
  describedBy,
  Field,
  FormActions,
  FormAlert,
} from "@/components/admin/form-fields";
import type {
  SiteContentFormState,
  SiteContentFormValues,
} from "@/lib/admin/site-content-form";
import type { SiteContentBlock } from "@/lib/site-content/blocks";
import { cn } from "@/lib/utils";

type SiteContentFormProps = {
  block: SiteContentBlock;
  initialValues: SiteContentFormValues;
  action: (
    state: SiteContentFormState,
    formData: FormData,
  ) => Promise<SiteContentFormState>;
};

const initialState: SiteContentFormState = { status: "idle", attempt: 0 };

function SiteContentForm({
  block,
  initialValues,
  action,
}: SiteContentFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const values = state.values ?? initialValues;
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    const firstInvalid = (["title", "content"] as const).find(
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
        {block.title ? (
          <Field
            name="title"
            label={block.title.label}
            hint={block.title.hint}
            error={errors.title}
          >
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={block.title.maxLength}
              autoComplete="off"
              defaultValue={values.title}
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={describedBy(
                "title",
                block.title.hint,
                errors.title,
              )}
              className={cn(controlClassName, "min-h-11")}
            />
          </Field>
        ) : null}

        <Field
          name="content"
          label={block.content.label}
          hint={block.content.hint}
          error={errors.content}
          optional={block.kind === "whatsapp"}
        >
          {block.kind === "whatsapp" ? (
            <input
              id="content"
              name="content"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              maxLength={block.content.maxLength}
              defaultValue={values.content}
              aria-invalid={errors.content ? true : undefined}
              aria-describedby={describedBy(
                "content",
                block.content.hint,
                errors.content,
              )}
              className={cn(controlClassName, "min-h-11")}
            />
          ) : (
            <textarea
              id="content"
              name="content"
              required
              rows={block.content.multiline ? 6 : 3}
              maxLength={block.content.maxLength}
              defaultValue={values.content}
              aria-invalid={errors.content ? true : undefined}
              aria-describedby={describedBy(
                "content",
                block.content.hint,
                errors.content,
              )}
              className={controlClassName}
            />
          )}
        </Field>
      </div>

      <FormActions
        cancelHref="/admin/content"
        submitLabel={
          block.kind === "whatsapp" ? "Guardar número" : "Guardar texto"
        }
        isPending={isPending}
      />
    </form>
  );
}

export { SiteContentForm };
