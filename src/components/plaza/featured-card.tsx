import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { AssociationContact } from "@/components/catalog/association-contact";
import { AssociationLogo } from "@/components/catalog/association-logo";
import type { PublicProduct } from "@/lib/catalog/queries";
import { getMediaUrl } from "@/lib/media";
import {
  formatPresentationSize,
  formatReferencePrice,
} from "@/lib/presentation-format";
import {
  getAbsoluteUrl,
  getAssociationHref,
  getProductDetailHref,
} from "@/lib/public-routes";
import { cn } from "@/lib/utils";

type FeaturedCardProps = {
  product: PublicProduct;
  /** Published products of its association, to point at the rest. */
  productCount: number;
};

/**
 * One featured product's card: who makes it and where, presentations with
 * reference prices, the contact action, its description and links. Rendered
 * on the server (the contact resolves the WhatsApp number there) and handed
 * to the hero carousel as a finished slide.
 */
function FeaturedCard({ product, productCount }: FeaturedCardProps) {
  const { association } = product;
  const productHref = getProductDetailHref(association.slug, product.slug);
  const otherProducts = productCount - 1;
  const presentationCount = product.presentations.length;
  const hasPrices = product.presentations.some(
    ({ referencePrice }) => referencePrice !== null,
  );

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Only a real logo: without one, the name stands alone. */}
        {getMediaUrl(association.logoObjectKey) ? (
          <AssociationLogo
            name={association.name}
            objectKey={association.logoObjectKey}
            sizes="48px"
            className="size-12 rounded-full"
          />
        ) : null}
        <div className="min-w-0">
          <p className="font-editorial text-lg leading-snug font-semibold wrap-anywhere lg:text-base">
            <Link
              href={getAssociationHref(association.slug)}
              className="decoration-primary decoration-2 underline-offset-4 hover:underline"
            >
              {association.name}
            </Link>
          </p>
          {association.location ? (
            <p className="font-editorial leading-snug italic">
              {association.location}
            </p>
          ) : null}
        </div>
      </div>

      <h2
        id="destacado-producto"
        className="font-editorial mt-3 text-[2.125rem] leading-[1.02] font-semibold tracking-[-0.02em] text-balance wrap-anywhere md:text-[2.75rem] lg:text-[2.25rem]"
      >
        <Link
          href={productHref}
          className="decoration-primary decoration-2 underline-offset-[6px] hover:underline"
        >
          {product.name}
        </Link>
      </h2>
      <p className="text-muted-foreground mt-1.5 text-sm font-medium">
        {product.categoryName}
        {presentationCount > 0
          ? ` · ${presentationCount === 1 ? "1 presentación" : `${presentationCount} presentaciones`}`
          : ""}
        {hasPrices ? (
          <span className="text-muted-foreground/80 text-xs font-normal">
            {" "}
            · Precios de referencia
          </span>
        ) : null}
      </p>

      <PriceBoard
        presentations={product.presentations}
        productHref={productHref}
      />

      <div className="mt-4 sm:mt-5">
        <AssociationContact
          associationName={association.name}
          whatsappNumber={association.whatsappNumber}
          productName={product.name}
          productUrl={getAbsoluteUrl(productHref)}
          note="Se abre WhatsApp con un mensaje sobre este producto. AROMA no procesa pagos ni pedidos."
          showNotes={false}
          fullWidth
        />
      </div>

      {product.shortDescription ? (
        <p
          className={cn(
            "font-editorial text-muted-foreground mt-5 line-clamp-3 text-lg leading-relaxed lg:mt-4 lg:line-clamp-2 lg:text-base lg:[@media(max-height:50rem)]:hidden",
            // With the presentations cut short, the card links to the full
            // page instead and keeps its height inside the hero.
            presentationCount > MAX_PRESENTATIONS && "lg:hidden",
          )}
        >
          {product.shortDescription}
        </p>
      ) : null}

      <ul className="mt-5 flex flex-wrap gap-x-6 border-t pt-2 text-[0.9375rem] font-semibold lg:mt-4 lg:gap-x-5 lg:pt-1 lg:text-sm">
        <li>
          <Link
            href={productHref}
            className="text-primary inline-flex min-h-11 items-center gap-1.5 underline-offset-4 hover:underline"
          >
            Ver ficha completa
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </li>
        {otherProducts > 0 ? (
          <li>
            <Link
              href={getAssociationHref(association.slug)}
              className="text-primary inline-flex min-h-11 items-center gap-1.5 underline-offset-4 hover:underline"
            >
              Más productos ({otherProducts})
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </li>
        ) : null}
      </ul>
    </>
  );
}

/** Rows shown in the card; the rest are on the product page. */
const MAX_PRESENTATIONS = 4;

function PriceBoard({
  presentations,
  productHref,
}: {
  presentations: PublicProduct["presentations"];
  productHref: string;
}) {
  if (presentations.length === 0) {
    return (
      <p className="border-foreground mt-3 border-y py-3 sm:mt-5 text-[0.9375rem] font-medium">
        Presentaciones y precios: pregúntale a la asociación por WhatsApp.
      </p>
    );
  }

  const shown = presentations.slice(0, MAX_PRESENTATIONS);
  const hidden = presentations.length - shown.length;

  return (
    <>
      <ul className="border-foreground mt-3 border-t sm:mt-5">
        {shown.map((presentation) => {
          const size = formatPresentationSize(presentation);
          const price = formatReferencePrice(presentation.referencePrice);
          // "Bolsa 250 g" already says its size; do not repeat "· 250 g".
          const showSize =
            size !== "" &&
            !normalize(presentation.name).includes(normalize(size));
          return (
            <li
              key={presentation.id}
              className="flex items-baseline justify-between gap-4 border-b py-1.5 sm:py-2 lg:[@media(max-height:50rem)]:py-1"
            >
              <span className="min-w-0 wrap-anywhere">
                <span className="font-semibold">{presentation.name}</span>
                {showSize ? (
                  <span className="text-muted-foreground"> · {size}</span>
                ) : null}
              </span>
              <span className="font-sign shrink-0 text-[2rem] leading-none md:text-[2.25rem] lg:text-[2rem] lg:[@media(max-height:50rem)]:text-[1.75rem]">
                {price ?? (
                  <span className="text-muted-foreground font-sans text-sm font-medium">
                    Consultar
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {hidden > 0 ? (
        <Link
          href={productHref}
          className="text-primary mt-1 inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold underline-offset-4 hover:underline"
        >
          Ver todas las presentaciones ({presentations.length})
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      ) : null}
    </>
  );
}

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export { FeaturedCard };
