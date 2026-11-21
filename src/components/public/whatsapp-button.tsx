import type { ReactNode } from "react";

import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WhatsAppButtonProps = {
  href: string;
  /**
   * The site's only two WhatsApp styles. "primary" (solid green) is the
   * product's action; "secondary" (neutral border, dark text, transparent
   * ground) is every other conversation.
   */
  priority: "primary" | "secondary";
  size?: "default" | "lg";
  /** Layout only (width, alignment); never color. */
  className?: string;
  children: ReactNode;
};

/** A link that opens a WhatsApp chat in a new tab, styled as a button. */
function WhatsAppButton({
  href,
  priority,
  size = "default",
  className,
  children,
}: WhatsAppButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({
          variant: priority === "primary" ? "default" : "outline",
          size,
        }),
        priority === "secondary" &&
          "text-foreground bg-transparent dark:bg-transparent",
        className,
      )}
    >
      <WhatsAppIcon />
      {children}
      <span className="sr-only">(se abre en una nueva pestaña)</span>
    </a>
  );
}

export { WhatsAppButton };
