import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = ComponentProps<"div"> & {
  title: string;
  description?: string;
  as?: "h1" | "h2" | "h3";
};

function SectionHeading({
  title,
  description,
  as: Heading = "h2",
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl space-y-2", className)} {...props}>
      <Heading className="font-heading text-brand-burgundy text-3xl leading-tight font-semibold tracking-tight wrap-anywhere text-balance md:text-4xl">
        {title}
      </Heading>

      {description ? (
        <p className="text-muted-foreground text-base leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export { SectionHeading };
