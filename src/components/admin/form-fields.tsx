import { ChevronDown, CircleAlert } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Building blocks shared by the admin forms. */
export const controlClassName =
  "border-input bg-card w-full rounded-md border px-3 py-2.5 text-base leading-6 transition-colors placeholder:text-muted-foreground/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-destructive";

export function describedBy(name: string, hint?: string, error?: string) {
  return (
    [hint && `${name}-ayuda`, error && `${name}-error`]
      .filter(Boolean)
      .join(" ") || undefined
  );
}

type FieldProps = {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
};

export function Field({
  name,
  label,
  hint,
  error,
  optional,
  children,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="flex items-baseline gap-1.5 font-bold">
        {label}
        {optional ? (
          <span className="text-muted-foreground text-sm font-normal">
            (opcional)
          </span>
        ) : null}
      </label>
      {children}
      {/* Filled by CharacterBudget when few characters are left. */}
      <p
        data-char-budget={name}
        aria-live="polite"
        hidden
        className="text-muted-foreground data-[full=true]:text-correction text-sm font-bold"
      />
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

export function SelectControl(props: ComponentProps<"select">) {
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

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  /** Only when it says something the title does not. */
  description?: string;
  children: ReactNode;
}) {
  return (
    // Title beside the fields only where the sheet is wide enough; in a
    // narrow column (beside a side panel) it sits above them.
    <div className="@container">
      <fieldset className="bg-card grid gap-5 rounded-md border p-4 sm:p-6 @3xl:grid-cols-[12rem_minmax(0,1fr)] @3xl:gap-10">
        <div className="space-y-1">
          <legend className="float-left text-lg font-bold">{title}</legend>
          {description ? (
            <p className="text-muted-foreground clear-left text-sm">
              {description}
            </p>
          ) : null}
        </div>
        <div className="max-w-2xl space-y-6">{children}</div>
      </fieldset>
    </div>
  );
}

export function FormAlert({ message }: { message?: string }) {
  return message ? (
    <div
      role="alert"
      className="border-destructive/40 bg-destructive/5 text-destructive flex items-start gap-2 rounded-md border px-4 py-3 text-sm font-medium"
    >
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      {message}
    </div>
  ) : null;
}

export function FormActions({
  cancelHref,
  submitLabel,
  isPending,
  secondaryAction,
  note,
}: {
  cancelHref: string;
  submitLabel: string;
  isPending: boolean;
  /**
   * A less frequent action, such as deleting (or why it is not possible):
   * on the left of the bar from 640 px; on phones at the end of the form,
   * out of the bar that follows the thumb.
   */
  secondaryAction?: ReactNode;
  note?: ReactNode;
}) {
  return (
    <>
      {secondaryAction ? (
        <div className="pt-2 pb-1 sm:hidden">{secondaryAction}</div>
      ) : null}
      {/* Stays in view while the form scrolls, above the phone's tab bar; a
          sheet of its own on the paper, a ruled footer inside a card. */}
      <div className="bg-card sticky bottom-(--admin-tabbar-height) z-20 -mx-4 space-y-3 border-t px-4 py-3 sm:mx-0 sm:rounded-md sm:border lg:bottom-4 in-[.bg-card]:mx-0! in-[.bg-card]:rounded-none! in-[.bg-card]:border-x-0! in-[.bg-card]:border-b-0! in-[.bg-card]:px-0! in-[.bg-card]:pb-0!">
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {/* The same action, rendered once per layout: only one is shown. */}
          {secondaryAction ? (
            <div className="mr-auto min-w-0 max-sm:hidden">
              {secondaryAction}
            </div>
          ) : null}
          <Link
            href={cancelHref}
            className={buttonVariants({ variant: "outline" })}
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={isPending} className="max-sm:flex-1">
            {isPending ? "Guardando…" : submitLabel}
          </Button>
        </div>
        {note}
      </div>
    </>
  );
}
