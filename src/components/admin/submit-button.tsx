"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type SubmitButtonProps = ComponentProps<typeof Button> & {
  pendingLabel?: string;
};

/** Submit button that disables itself while its form is being sent. */
function SubmitButton({
  children,
  pendingLabel,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending} {...props}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}

export { SubmitButton };
