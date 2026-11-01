import { ArrowLeft, ArrowRight, ImagePlus, Pencil, Plus } from "lucide-react";
import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ProductImagePreview } from "@/components/admin/product-image-preview";
import { SubmitButton } from "@/components/admin/submit-button";
import { buttonVariants } from "@/components/ui/button";
import type { ProductImage } from "@/lib/admin/product-image-mutations";
import { MAX_IMAGES_PER_PRODUCT } from "@/lib/storage/product-images";
import { cn } from "@/lib/utils";

type ProductImagesPanelProps = {
  productId: string;
  productName: string;
  images: ProductImage[];
  canUpload: boolean;
  moveAction: (
    imageId: string,
    direction: "up" | "down",
  ) => () => Promise<void>;
};

function ProductImagesPanel({
  productId,
  productName,
  images,
  canUpload,
  moveAction,
}: ProductImagesPanelProps) {
  const newImageHref = `/admin/products/${productId}/images/new`;
  const isFull = images.length >= MAX_IMAGES_PER_PRODUCT;
  const addLink = (
    <Link
      href={newImageHref}
      className={buttonVariants({
        variant: "outline",
        className: "w-full sm:w-auto",
      })}
    >
      <Plus aria-hidden />
      Agregar imagen
    </Link>
  );

  return (
    <>
      {canUpload ? null : (
        <AdminNotice tone="warning">
          La subida de imágenes aún no está configurada. Avísale a la
          administración de la alianza.
        </AdminNotice>
      )}

      {images.length === 0 ? (
        <AdminEmptyState
          icon={ImagePlus}
          title="Sin imágenes"
          description="Sin foto, la vitrina muestra el símbolo de AROMA. Agrega una para que el producto se vea como es."
          action={canUpload ? addLink : undefined}
        />
      ) : (
        <>
          <ol
            aria-label="Imágenes del producto"
            className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4"
          >
            {images.map((image, index) => {
              const label = `imagen ${index + 1}`;

              return (
                <li key={image.id} className="min-w-0 space-y-2">
                  <div className="relative">
                    <ProductImagePreview
                      objectKey={image.objectKey}
                      alt={image.altText ?? productName}
                      sizes="(min-width: 1024px) 12rem, (min-width: 640px) 30vw, 45vw"
                    />
                    {image.isPrimary ? (
                      <span className="bg-card absolute top-2 left-2 rounded-sm px-1.5 py-0.5 font-mono text-[0.6875rem] font-medium tracking-[0.06em] uppercase shadow-sm">
                        Principal
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={cn(
                      "line-clamp-2 text-sm wrap-anywhere",
                      !image.altText && "text-muted-foreground",
                    )}
                  >
                    {image.altText ?? "Sin texto alternativo"}
                  </p>
                  <div className="flex items-center gap-1">
                    <form action={moveAction(image.id, "up")}>
                      <SubmitButton
                        variant="ghost"
                        size="icon"
                        disabled={index === 0}
                        aria-label={`Mover la ${label} antes`}
                      >
                        <ArrowLeft aria-hidden />
                      </SubmitButton>
                    </form>
                    <form action={moveAction(image.id, "down")}>
                      <SubmitButton
                        variant="ghost"
                        size="icon"
                        disabled={index === images.length - 1}
                        aria-label={`Mover la ${label} después`}
                      >
                        <ArrowRight aria-hidden />
                      </SubmitButton>
                    </form>
                    <Link
                      href={`/admin/products/${productId}/images/${image.id}/edit`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className: "ml-auto",
                      })}
                    >
                      <Pencil aria-hidden />
                      Editar
                      <span className="sr-only">{label}</span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>

          {canUpload ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              {isFull ? null : addLink}
              <p className="text-muted-foreground text-sm">
                {isFull
                  ? `Llegaste al máximo de ${MAX_IMAGES_PER_PRODUCT} imágenes. Elimina una para agregar otra.`
                  : `${images.length} de ${MAX_IMAGES_PER_PRODUCT} imágenes.`}
              </p>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}

export { ProductImagesPanel };
