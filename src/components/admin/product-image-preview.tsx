import Image from "next/image";

import { ImageZoom } from "@/components/admin/image-zoom";
import { AromaLogo } from "@/components/brand/aroma-logo";
import { getMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type ProductImagePreviewProps = {
  objectKey: string;
  alt: string;
  sizes: string;
  /** Load right away, for a preview that is the page's main content. */
  eager?: boolean;
  className?: string;
};

/** A stored product image at the storefront's 4:5 ratio; a click opens it whole. */
function ProductImagePreview({
  objectKey,
  alt,
  sizes,
  eager = false,
  className,
}: ProductImagePreviewProps) {
  const url = getMediaUrl(objectKey);

  return (
    <div
      className={cn(
        "bg-muted relative aspect-4/5 overflow-hidden rounded-sm",
        className,
      )}
    >
      {url ? (
        <ImageZoom
          src={url}
          alt={alt}
          label="Ver la foto completa"
          className="h-full"
        >
          <Image
            src={url}
            alt={alt}
            fill
            sizes={sizes}
            loading={eager ? "eager" : undefined}
            className="object-cover"
          />
        </ImageZoom>
      ) : (
        <div className="flex h-full items-center justify-center">
          <AromaLogo variant="symbol" className="w-12 opacity-35 grayscale" />
        </div>
      )}
    </div>
  );
}

export { ProductImagePreview };
