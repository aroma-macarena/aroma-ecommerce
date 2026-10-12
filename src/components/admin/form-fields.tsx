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
  description: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="border-foreground grid gap-5 border-t pt-5 first-of-type:border-t-0 first-of-type:pt-0 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10">
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
  /** A less frequent action, such as deleting, kept apart on the left. */
  secondaryAction?: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className="border-foreground space-y-3 border-t-[1.5px] pt-5">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        {secondaryAction ? (
          <div className="sm:mr-auto">{secondaryAction}</div>
        ) : null}
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
      {note}
    </div>
  );
}
