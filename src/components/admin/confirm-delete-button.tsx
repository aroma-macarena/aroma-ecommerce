"use client";

import { Trash2 } from "lucide-react";

import { ConfirmActionButton } from "@/components/admin/confirm-action-button";

type ConfirmDeleteButtonProps = {
  label: string;
  title: string;
  description: string;
  action: () => Promise<void>;
  disabled?: boolean;
  "aria-describedby"?: string;
};

/** A delete button that asks for confirmation in a dialog before acting. */
function ConfirmDeleteButton({ label, ...props }: ConfirmDeleteButtonProps) {
  return (
    <ConfirmActionButton
      {...props}
      trigger={
        <>
          <Trash2 aria-hidden />
          {label}
        </>
      }
      triggerVariant="ghost"
      triggerClassName="text-destructive hover:bg-destructive/10 hover:text-destructive w-full sm:w-auto"
      confirmLabel={label}
      pendingLabel="Eliminando…"
      tone="destructive"
    />
  );
}

export { ConfirmDeleteButton };
