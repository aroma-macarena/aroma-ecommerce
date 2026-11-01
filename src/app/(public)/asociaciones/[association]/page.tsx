import { ArrowLeft, PackageOpen } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { AssociationContact } from "@/components/catalog/association-contact";
import { AssociationLogo } from "@/components/catalog/association-logo";
import { ProductCard } from "@/components/catalog/product-card";
import { Container } from "@/components/public/container";
import { getPublicAssociation } from "@/lib/catalog/queries";
import { getMediaUrl } from "@/lib/media";
import {
  getAbsoluteUrl,
  getAssociationHref,
  publicRoutes,
} from "@/lib/public-routes";
import { getAssociationInquiryMessage } from "@/lib/whatsapp";

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
  const productCount = association.products.length;

  return (
    <article aria-labelledby="asociacion-titulo">
      <Container className="space-y-12 pt-6 pb-16 md:space-y-20 md:pt-10 md:pb-24">
        <div className="space-y-6 md:space-y-8">
          <Link
            href={publicRoutes.associations}
            className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Asociaciones
          </Link>

          {coverUrl ? (
            <div className="bg-muted relative aspect-[16/9] overflow-hidden rounded-sm md:aspect-[21/8]">
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

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
            <div className="space-y-8">
              <div className="border-foreground flex items-start gap-4 border-b-[1.5px] pb-6 sm:gap-6">
                <AssociationLogo
                  name={association.name}
                  objectKey={association.logoObjectKey}
                  sizes="6rem"
                  className="w-16 sm:w-24"
                />
                <div className="min-w-0 space-y-2 wrap-anywhere">
                  <p className="text-primary font-mono text-xs font-medium tracking-[0.08em] uppercase">
                    Asociación de la Alianza AROMA
                  </p>
                  <h1
                    id="asociacion-titulo"
                    className="font-heading text-3xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance md:text-5xl"
                  >
                    {association.name}
                  </h1>
                  {association.location ? (
                    <p className="font-mono text-[0.8125rem]">
                      {association.location}
                    </p>
                  ) : null}
                </div>
              </div>

              {association.description ? (
                <p className="max-w-prose text-lg leading-relaxed whitespace-pre-line">
                  {association.description}
                </p>
              ) : null}

              {association.history ? (
                <section
                  aria-labelledby="historia-titulo"
                  className="space-y-3"
                >
                  <h2
                    id="historia-titulo"
                    className="font-heading text-2xl font-semibold tracking-[-0.02em]"
                  >
                    Historia
                  </h2>
                  <p className="text-muted-foreground max-w-prose leading-relaxed whitespace-pre-line">
                    {association.history}
                  </p>
                </section>
              ) : null}
            </div>

            <aside
              aria-label="Contacto"
              className="border-foreground bg-card space-y-4 self-start rounded-md border-[1.5px] p-5 md:p-6 lg:sticky lg:top-24"
            >
              <p className="font-mono text-xs font-medium tracking-[0.08em] uppercase">
                Contacto
              </p>
              <AssociationContact
                associationName={association.name}
                whatsappNumber={association.whatsappNumber}
                message={getAssociationInquiryMessage({
                  associationName: association.name,
                  associationUrl: getAbsoluteUrl(
                    getAssociationHref(association.slug),
                  ),
                })}
                note="Se abre WhatsApp con un mensaje listo. La conversación sigue directamente con la asociación: AROMA no procesa pagos ni pedidos."
                fullWidth
              />
            </aside>
          </div>
        </div>

        <section aria-labelledby="productos-titulo" className="space-y-8">
          <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-end sm:justify-between">
            <h2
              id="productos-titulo"
              className="font-heading text-3xl leading-tight font-semibold tracking-[-0.03em] md:text-[2.5rem]"
            >
              Sus productos
            </h2>
            {productCount > 0 ? (
              <p className="text-muted-foreground font-mono text-xs tracking-[0.04em] uppercase">
                {productCount === 1
                  ? "1 producto"
                  : `${productCount} productos`}
              </p>
            ) : null}
          </div>

          {productCount > 0 ? (
            <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {association.products.map((product) => (
                <li key={product.id} className="min-w-0">
                  <ProductCard product={product} showAssociation={false} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex max-w-xl items-start gap-3 py-2">
              <PackageOpen
                aria-hidden
                className="text-muted-foreground mt-1 size-5 shrink-0"
              />
              <p className="text-muted-foreground leading-relaxed">
                {association.name} aún no tiene productos publicados en la
                vitrina.
              </p>
            </div>
          )}
        </section>
      </Container>
    </article>
  );
}
