"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Trash2 } from "lucide-react";

import { SubmitButton } from "@/components/admin/submit-button";
import { Button } from "@/components/ui/button";

type ConfirmDeleteButtonProps = {
  label: string;
  title: string;
  description: string;
  action: () => Promise<void>;
  disabled?: boolean;
  "aria-describedby"?: string;
};

/** A delete button that asks for confirmation in a dialog before acting. */
function ConfirmDeleteButton({
  label,
  title,
  description,
  action,
  disabled,
  "aria-describedby": describedBy,
}: ConfirmDeleteButtonProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger
        disabled={disabled}
        aria-describedby={describedBy}
        render={<Button variant="destructive" />}
      >
        <Trash2 aria-hidden />
        {label}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/30 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="bg-popover text-popover-foreground fixed top-1/2 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-lg border p-6 shadow-xl transition duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0">
          <AlertDialog.Title className="font-heading text-xl font-semibold tracking-[-0.015em]">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-muted-foreground leading-relaxed">
            {description}
          </AlertDialog.Description>
          <form
            action={action}
            className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"
          >
            <AlertDialog.Close render={<Button variant="outline" />}>
              Cancelar
            </AlertDialog.Close>
            <SubmitButton
              className="bg-destructive hover:bg-destructive/90 text-white"
              pendingLabel="Eliminando…"
            >
              {label}
            </SubmitButton>
          </form>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export { ConfirmDeleteButton };
