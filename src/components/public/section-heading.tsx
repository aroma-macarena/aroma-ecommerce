import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = ComponentProps<"div"> & {
  title: string;
  description?: string;
};

function SectionHeading({
  title,
  description,
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl space-y-2", className)} {...props}>
      <h2 className="font-heading text-3xl font-semibold tracking-tight">
        {title}
      </h2>

      {description ? (
        <p className="text-muted-foreground text-base leading-7">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export { SectionHeading };
