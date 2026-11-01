import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  success: {
    icon: CircleCheck,
    role: "status",
    className: "border-primary bg-accent",
    iconClassName: "text-primary",
  },
  warning: {
    icon: Info,
    role: undefined,
    className: "border-brand-orange bg-card",
    iconClassName: "text-brand-orange",
  },
  error: {
    icon: CircleAlert,
    role: "alert",
    className: "border-destructive bg-destructive/5 text-destructive",
    iconClassName: "",
  },
} as const;

type AdminNoticeProps = {
  tone: keyof typeof tones;
  children: ReactNode;
  className?: string;
};

/** A one-line message with a colored left rule: confirmations and warnings. */
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
        "flex items-start gap-2 border-l-[3px] px-4 py-3 text-sm font-medium",
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
