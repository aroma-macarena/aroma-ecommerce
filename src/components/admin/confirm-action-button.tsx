"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import type { ReactNode } from "react";

import { SubmitButton } from "@/components/admin/submit-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmActionButtonProps = {
  /** Content of the button that opens the dialog. */
  trigger: ReactNode;
  triggerVariant?: "outline" | "ghost" | "default";
  triggerClassName?: string;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  /** Destructive actions confirm with a red button. */
  tone?: "default" | "destructive";
  action: () => Promise<void>;
  disabled?: boolean;
  "aria-describedby"?: string;
};

/** A button that explains an action's effect in a dialog before running it. */
function ConfirmActionButton({
  trigger,
  triggerVariant = "outline",
  triggerClassName,
  title,
  description,
  confirmLabel,
  pendingLabel,
  tone = "default",
  action,
  disabled,
  "aria-describedby": describedBy,
}: ConfirmActionButtonProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger
        disabled={disabled}
        aria-describedby={describedBy}
        render={
          <Button
            type="button"
            variant={triggerVariant}
            className={triggerClassName}
          />
        }
      >
        {trigger}
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
              className={cn(
                tone === "destructive" &&
                  "bg-destructive hover:bg-destructive/90 text-white",
              )}
              pendingLabel={pendingLabel}
            >
              {confirmLabel}
            </SubmitButton>
          </form>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export { ConfirmActionButton };
