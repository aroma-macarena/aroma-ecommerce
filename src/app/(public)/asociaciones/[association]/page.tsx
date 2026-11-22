import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { AssociationLogo } from "@/components/catalog/association-logo";
import {
  AssociationGallery,
  type GalleryPhoto,
} from "@/components/plaza/association-gallery";
import { PlazaProductGrid } from "@/components/plaza/plaza-product-card";
import { TerritoryMap } from "@/components/plaza/territory-map";
import { Container } from "@/components/public/container";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { formatZoneSuffix, getTerritoryZone } from "@/content/territory";
import { getPublicAssociation } from "@/lib/catalog/queries";
import { getMediaUrl } from "@/lib/media";
import {
  getAbsoluteUrl,
  getAssociationHref,
  publicRoutes,
} from "@/lib/public-routes";
import {
  territoryAspectRatio,
  territoryPercent,
} from "@/lib/territory-geometry";
import { getAssociationInquiryMessage, getWhatsAppHref } from "@/lib/whatsapp";

type AssociationPageProps = PageProps<"/asociaciones/[association]">;

// Metadata and the page share one query per request.
const findAssociation = cache(getPublicAssociation);

export async function generateMetadata({
  params,
}: AssociationPageProps): Promise<Metadata> {
  const association = await findAssociation((await params).association);

  if (!association) {
    return { title: "Asociación no encontrada" };
  }

  const imageUrl = getMediaUrl(
    association.coverObjectKey ?? association.logoObjectKey,
  );

  return {
    title: association.name,
    description:
      association.description ??
      `${association.name}, organización de la Alianza AROMA en La Macarena, Meta.`,
    openGraph: imageUrl ? { images: [imageUrl] } : undefined,
  };
}

export default async function AssociationPage({
  params,
}: AssociationPageProps) {
  const association = await findAssociation((await params).association);

  if (!association) {
    notFound();
  }

  const coverUrl = getMediaUrl(association.coverObjectKey);
  const logoUrl = getMediaUrl(association.logoObjectKey);
  const zone = getTerritoryZone(association.zone);
  // Secondary on the profile: the product pages carry the main contact.
  const whatsappHref = getWhatsAppHref(
    association.whatsappNumber,
    getAssociationInquiryMessage({
      associationName: association.name,
      associationUrl: getAbsoluteUrl(getAssociationHref(association.slug)),
    }),
  );
  const productCount = association.products.length;
  const hasStory = Boolean(association.description || association.history);
  const photos: GalleryPhoto[] = association.photos.flatMap((photo) => {
    const url = getMediaUrl(photo.objectKey);
    return url
      ? [
          {
            id: photo.id,
            url,
            alt:
              photo.altText ?? photo.caption ?? `Foto de ${association.name}`,
            caption: photo.caption,
          },
        ]
      : [];
  });

  return (
    <article aria-labelledby="asociacion-titulo">
      <Container className="space-y-12 pt-4 pb-16 md:space-y-14 md:pt-6 md:pb-24">
        <div className="space-y-6 md:space-y-8">
          <Link
            href={publicRoutes.associations}
            className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold transition-colors"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Asociaciones
          </Link>

          {coverUrl ? (
            <div className="bg-muted relative aspect-[16/9] overflow-hidden md:aspect-[21/8]">
              <Image
                src={coverUrl}
                alt=""
                fill
                preload
                sizes="(min-width: 1152px) 72rem, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          {/* On phones the contact button runs under the whole header; on
              wider screens it closes the name's line, out of the way. */}
          <header className="flex flex-col gap-6 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5 lg:flex-1">
              {/* Without a logo the name leads alone, with no empty tile. */}
              {logoUrl ? (
                <AssociationLogo
                  name={association.name}
                  objectKey={association.logoObjectKey}
                  sizes="5rem"
                  className="size-16 shrink-0 rounded-full sm:size-20"
                />
              ) : null}
              <div className="min-w-0 wrap-anywhere">
                <h1
                  id="asociacion-titulo"
                  className="font-editorial text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.02em] text-balance md:text-[3.25rem]"
                >
                  {association.name}
                </h1>
                {zone ? (
                  <p className="mt-2 leading-snug">
                    <span className="font-editorial text-lg italic">
                      {zone.name}
                    </span>
                    <span className="text-muted-foreground">
                      {formatZoneSuffix(zone)}
                    </span>
                  </p>
                ) : association.location ? (
                  <p className="font-editorial mt-2 text-lg italic">
                    {association.location}
                  </p>
                ) : null}
              </div>
            </div>
            {whatsappHref ? (
              <WhatsAppButton
                href={whatsappHref}
                priority="secondary"
                className="w-full shrink-0 lg:w-auto"
              >
                Escribir por WhatsApp
              </WhatsAppButton>
            ) : null}
          </header>

          {hasStory || zone ? (
            // Wide screens: the map floats right and the description and
            // history wrap around it, then run the full width below it.
            // Phones: the text first, the map after it.
            <div className="flex flex-col gap-10 lg:block lg:flow-root">
              {zone ? (
                <figure className="order-last lg:float-right lg:mb-4 lg:ml-12 lg:w-[40%]">
                  <div
                    className="bg-card relative border"
                    style={{ aspectRatio: territoryAspectRatio }}
                  >
                    <TerritoryMap compact />
                    <span
                      aria-hidden
                      style={{
                        left: `${territoryPercent(zone.lat, zone.lon).left}%`,
                        top: `${territoryPercent(zone.lat, zone.lon).top}%`,
                      }}
                      className="bg-primary absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_2px_8px_oklch(0_0_0/0.25)]"
                    />
                  </div>
                  <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="text-sm">
                      <span className="font-editorial text-base italic">
                        {zone.name}
                      </span>
                      <span className="text-muted-foreground">
                        {formatZoneSuffix(zone, "zona aproximada")}
                      </span>
                    </span>
                    <Link
                      href={publicRoutes.associations}
                      className="text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                    >
                      Ver todas en el mapa
                      <ArrowRight aria-hidden className="size-4" />
                    </Link>
                  </figcaption>
                </figure>
              ) : null}
              {hasStory ? (
                <div className="space-y-10">
                  {association.description ? (
                    <p className="font-editorial text-xl leading-relaxed whitespace-pre-line md:text-[1.375rem]">
                      {association.description}
                    </p>
                  ) : null}
                  {association.history ? (
                    <section aria-labelledby="historia-titulo">
                      <h2
                        id="historia-titulo"
                        className="font-editorial text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.01em]"
                      >
                        Historia
                      </h2>
                      <p className="text-muted-foreground mt-3 text-lg leading-relaxed whitespace-pre-line">
                        {association.history}
                      </p>
                    </section>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {photos.length > 0 ? (
          <section aria-labelledby="territorio-titulo">
            <h2
              id="territorio-titulo"
              className="font-sign border-b pb-5 text-[2.5rem] leading-[0.92] uppercase md:text-[3.25rem]"
            >
              En su territorio
            </h2>
            <div className="mt-8">
              <AssociationGallery photos={photos} />
            </div>
          </section>
        ) : null}

        <section aria-labelledby="productos-titulo">
          <div className="flex flex-col gap-2 border-b pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <h2
              id="productos-titulo"
              className="font-sign text-[2.5rem] leading-[0.92] uppercase md:text-[3.25rem]"
            >
              Sus productos
            </h2>
            {productCount > 0 ? (
              <p className="text-muted-foreground text-sm font-semibold">
                {productCount === 1
                  ? "1 producto"
                  : `${productCount} productos`}
              </p>
            ) : null}
          </div>

          {productCount > 0 ? (
            <div className="mt-8">
              <PlazaProductGrid
                products={association.products}
                showAssociation={false}
              />
            </div>
          ) : (
            <p className="font-editorial text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
              {association.name} aún no tiene productos publicados en la
              vitrina.
            </p>
          )}
        </section>
      </Container>
    </article>
  );
}
