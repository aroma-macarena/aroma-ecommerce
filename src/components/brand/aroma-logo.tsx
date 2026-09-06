import Image from "next/image";

import { cn } from "@/lib/utils";

type AromaLogoProps = {
  className?: string;
  variant?: "horizontal" | "symbol";
};

function AromaLogo({ className, variant = "horizontal" }: AromaLogoProps) {
  const isSymbol = variant === "symbol";

  return (
    <Image
      src={
        isSymbol
          ? "/brand/aroma-symbol.png"
          : "/brand/aroma-logo-horizontal.png"
      }
      alt="Alianza AROMA"
      width={isSymbol ? 1183 : 1895}
      height={isSymbol ? 892 : 679}
      className={cn("h-auto", isSymbol ? "w-16" : "w-56", className)}
    />
  );
}

export { AromaLogo };
