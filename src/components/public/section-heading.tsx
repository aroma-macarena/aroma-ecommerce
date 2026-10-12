import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = ComponentProps<"div"> & {
  title: string;
  eyebrow?: string;
  description?: string;
  as?: "h1" | "h2" | "h3";
  tone?: "default" | "inverse";
};

function SectionHeading({
  title,
  eyebrow,
  description,
  as: Heading = "h2",
  tone = "default",
  className,
  ...props
}: SectionHeadingProps) {
  const supportingText =
    tone === "inverse" ? "text-background/85" : "text-muted-foreground";

  return (
    <div className={cn("max-w-2xl space-y-3", className)} {...props}>
      {eyebrow ? (
        <p
          className={cn(
            "font-mono text-xs font-medium tracking-[0.08em] uppercase",
            supportingText,
          )}
        >
          {eyebrow}
        </p>
      ) : null}

      <Heading
        className={cn(
          "font-heading font-semibold tracking-[-0.03em] wrap-anywhere text-balance",
          Heading === "h1"
            ? "text-[2.875rem] leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl"
            : "text-3xl leading-[1.05] md:text-[2.75rem]",
        )}
      >
        {title}
      </Heading>

      {description ? (
        <p className={cn("text-lg leading-relaxed", supportingText)}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

export { SectionHeading };
