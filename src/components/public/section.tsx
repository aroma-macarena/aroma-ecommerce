import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Section({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("py-12 md:py-16", className)} {...props} />;
}

export { Section };
