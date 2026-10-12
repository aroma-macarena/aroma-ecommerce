import Image from "next/image";

import { cn } from "@/lib/utils";

const logos = {
  horizontal: {
    src: "/brand/aroma-logo.svg",
    width: 2252,
    height: 766,
    className: "w-56",
  },
  descriptor: {
    src: "/brand/aroma-logo-descripcion.svg",
    width: 2260,
    height: 881,
    className: "w-64",
  },
  symbol: {
    src: "/brand/aroma-symbol.svg",
    width: 1075,
    height: 841,
    className: "w-16",
  },
} as const;

type AromaLogoProps = {
  className?: string;
  variant?: keyof typeof logos;
};

function AromaLogo({ className, variant = "horizontal" }: AromaLogoProps) {
  const logo = logos[variant];

  return (
    <Image
      src={logo.src}
      alt="Alianza AROMA"
      width={logo.width}
      height={logo.height}
      unoptimized
      className={cn("h-auto", logo.className, className)}
    />
  );
}

export { AromaLogo };
