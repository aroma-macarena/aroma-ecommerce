import Image from "next/image";

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

/** A stored product image at the storefront's 4:5 ratio. */
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
        <Image
          src={url}
          alt={alt}
          fill
          sizes={sizes}
          loading={eager ? "eager" : undefined}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <AromaLogo variant="symbol" className="w-12 opacity-35 grayscale" />
        </div>
      )}
    </div>
  );
}

export { ProductImagePreview };
