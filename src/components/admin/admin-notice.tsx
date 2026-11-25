import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  success: {
    icon: CircleCheck,
    role: "status",
    className: "border-primary/30 bg-accent text-accent-foreground",
    iconClassName: "text-primary",
  },
  warning: {
    icon: Info,
    role: undefined,
    className: "bg-card",
    iconClassName: "text-primary",
  },
  error: {
    icon: CircleAlert,
    role: "alert",
    className: "border-destructive/40 bg-destructive/5 text-destructive",
    iconClassName: "",
  },
} as const;

type AdminNoticeProps = {
  tone: keyof typeof tones;
  children: ReactNode;
  className?: string;
};

/** A one-line message in a bordered box: confirmations, notes and errors. */
function AdminNotice({ tone, children, className }: AdminNoticeProps) {
  const {
    icon: Icon,
    role,
    className: toneClassName,
    iconClassName,
  } = tones[tone];

  return (
    <p
      role={role}
      className={cn(
        "flex items-start gap-2 rounded-md border px-4 py-3 text-[0.9375rem] font-bold",
        toneClassName,
        className,
      )}
    >
      <Icon
        aria-hidden
        className={cn("mt-0.5 size-4 shrink-0", iconClassName)}
      />
      <span>{children}</span>
    </p>
  );
}

export { AdminNotice };
