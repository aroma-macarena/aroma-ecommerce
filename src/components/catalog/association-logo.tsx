import Image from "next/image";

import { AromaLogo } from "@/components/brand/aroma-logo";
import { getMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type AssociationLogoProps = {
  name: string;
  objectKey: string | null;
  sizes: string;
  className?: string;
};

/**
 * An association's logo on a square paper tile, or the AROMA symbol when it
 * has none: the alliance stands in rather than an invented mark.
 */
function AssociationLogo({
  name,
  objectKey,
  sizes,
  className,
}: AssociationLogoProps) {
  const url = getMediaUrl(objectKey);

  return (
    <div
      className={cn(
        "bg-card relative flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-md border",
        className,
      )}
    >
      {url ? (
        <Image
          src={url}
          alt={`Logo de ${name}`}
          fill
          sizes={sizes}
          className="object-contain p-2"
        />
      ) : (
        <AromaLogo variant="symbol" className="w-3/5 opacity-35 grayscale" />
      )}
    </div>
  );
}

export { AssociationLogo };
