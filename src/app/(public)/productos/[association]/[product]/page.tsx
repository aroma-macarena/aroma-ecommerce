import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, type ReactNode } from "react";

import { AssociationContact } from "@/components/catalog/association-contact";
import { AssociationLogo } from "@/components/catalog/association-logo";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductPresentations } from "@/components/catalog/product-presentations";
import { PlazaProductGrid } from "@/components/plaza/plaza-product-card";
import { Container } from "@/components/public/container";
import { getProducerLabel } from "@/lib/catalog/producers";
import { getCatalogProducts, getPublicProduct } from "@/lib/catalog/queries";
import { getMediaUrl } from "@/lib/media";
import {
  getAbsoluteUrl,
  getAssociationHref,
  getProductDetailHref,
  getProductsByCategoryHref,
  publicRoutes,
} from "@/lib/public-routes";

type ProductPageProps = PageProps<"/productos/[association]/[product]">;

// Metadata and the page share one query per request.
const findProduct = cache(getPublicProduct);

/** Other products shown under "Más de…"; the rest are on the profile. */
const MORE_PRODUCTS = 3;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { association, product: productSlug } = await params;
  const product = await findProduct(association, productSlug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const imageUrl = getMediaUrl(product.images[0]?.objectKey ?? null);

  return {
    title: `${product.name} · ${product.association.name}`,
    description:
      product.shortDescription ??
      `${product.name}, de ${product.association.name}, en la vitrina de la Alianza AROMA.`,
    openGraph: imageUrl ? { images: [imageUrl] } : undefined,
  };
}

/** Green underline on hover, as for every name link in the showcase. */
const nameLink =
  "decoration-primary decoration-2 underline-offset-4 hover:underline";

function OriginRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="grid gap-1 border-b py-3 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-muted-foreground text-sm font-semibold sm:pt-0.5">
        {label}
      </dt>
      <dd className="font-editorial text-lg leading-snug wrap-anywhere">
        {value}
      </dd>
    </div>
  );
}

function ProseBlock({
  id,
  title,
  text,
}: {
  id: string;
  title: string;
  text: string | null;
}) {
  if (!text) {
    return null;
  }

  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2
        id={id}
        className="font-editorial text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.01em]"
      >
        {title}
      </h2>
      <p className="font-editorial max-w-[62ch] text-lg leading-relaxed whitespace-pre-line">
        {text}
      </p>
    </section>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { association, product: productSlug } = await params;
  const product = await findProduct(association, productSlug);

  if (!product) {
    notFound();
  }

  const associationHref = getAssociationHref(product.association.slug);
  const productUrl = getAbsoluteUrl(
    getProductDetailHref(product.association.slug, product.slug),
  );
  const presentationCount = product.presentations.length;
  const associationProducts = await getCatalogProducts({
    associationSlug: product.association.slug,
  });
  const otherProducts = associationProducts.filter(
    ({ id }) => id !== product.id,
  );
  const hasPrices = product.presentations.some(
    ({ referencePrice }) => referencePrice !== null,
  );

  return (
    <article aria-labelledby="producto-titulo">
      <Container className="space-y-12 pt-4 pb-16 md:space-y-20 md:pt-6 md:pb-24">
        <div className="space-y-4 md:space-y-5">
          <nav aria-label="Ruta" className="text-sm">
            <ol className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link
                  href={publicRoutes.products}
                  className="hover:text-foreground inline-flex min-h-11 items-center gap-1.5 font-semibold transition-colors"
                >
                  <ArrowLeft aria-hidden className="size-4" />
                  Productos
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={getProductsByCategoryHref(product.categorySlug)}
                  className="hover:text-foreground inline-flex min-h-11 items-center font-semibold transition-colors"
                >
                  {product.categoryName}
                </Link>
              </li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
            <ProductGallery
              productName={product.name}
              images={product.images}
            />

            <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              <div className="wrap-anywhere">
                {/* Who makes it, then the name: the featured card's order. */}
                <div className="flex items-center gap-3">
                  {getMediaUrl(product.association.logoObjectKey) ? (
                    <AssociationLogo
                      name={product.association.name}
                      objectKey={product.association.logoObjectKey}
                      sizes="48px"
                      className="size-12 rounded-full"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-editorial text-lg leading-snug font-semibold">
                      <Link href={associationHref} className={nameLink}>
                        {product.association.name}
                      </Link>
                    </p>
                    {product.association.location ? (
                      <p className="font-editorial leading-snug italic">
                        {product.association.location}
                      </p>
                    ) : null}
                  </div>
                </div>
                <h1
                  id="producto-titulo"
                  className="font-editorial mt-4 text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.02em] text-balance md:text-[3.25rem]"
                >
                  {product.name}
                </h1>
                <p className="text-muted-foreground mt-2 text-sm font-medium">
                  {product.categoryName}
                  {presentationCount > 0
                    ? ` · ${presentationCount === 1 ? "1 presentación" : `${presentationCount} presentaciones`}`
                    : ""}
                </p>
                {product.shortDescription ? (
                  <p className="font-editorial text-muted-foreground mt-4 text-lg leading-relaxed md:text-xl">
                    {product.shortDescription}
                  </p>
                ) : null}
              </div>

              <ProductPresentations presentations={product.presentations} />

              <div className="space-y-3">
                <AssociationContact
                  associationName={product.association.name}
                  whatsappNumber={product.association.whatsappNumber}
                  productName={product.name}
                  productUrl={productUrl}
                  fullWidth
                />
                {hasPrices ? (
                  <p className="text-muted-foreground text-sm">
                    Precios de referencia en pesos colombianos. Confírmalos con
                    la asociación.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <section
            aria-labelledby="origen-titulo"
            className="bg-card border-foreground self-start border-t-[3px] px-5 pt-5 pb-6 md:px-6"
          >
            <h2
              id="origen-titulo"
              className="font-sign text-[1.75rem] leading-none uppercase md:text-[2rem]"
            >
              Etiqueta de origen
            </h2>
            <dl className="mt-4 border-t">
              <OriginRow
                label="Organización"
                value={
                  <Link href={associationHref} className={nameLink}>
                    {product.association.name}
                  </Link>
                }
              />
              <OriginRow
                label="Origen"
                value={
                  product.origin ? (
                    <span className="italic">{product.origin}</span>
                  ) : null
                }
              />
              <OriginRow label="Categoría" value={product.categoryName} />
              <OriginRow
                label="Disponibilidad"
                value={product.availabilityNote}
              />
            </dl>
            {product.association.description ? (
              <p className="text-muted-foreground mt-4 line-clamp-5 leading-relaxed">
                {product.association.description}
              </p>
            ) : null}
          </section>

          <div className="space-y-10">
            <ProseBlock
              id="descripcion-titulo"
              title="Sobre el producto"
              text={product.description}
            />
            <ProseBlock
              id="ingredientes-titulo"
              title="Ingredientes"
              text={product.ingredients}
            />
          </div>
        </div>

        {otherProducts.length > 0 ? (
          <section aria-labelledby="mas-titulo">
            <div className="flex flex-col gap-2 border-b pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
              <h2
                id="mas-titulo"
                className="font-editorial text-[2rem] leading-[1.05] font-semibold tracking-[-0.02em] text-balance md:text-[2.5rem]"
              >
                {/* Short name on screen, the full one for screen readers. */}
                <span aria-hidden>
                  Más de {getProducerLabel(product.association.name)}
                </span>
                <span className="sr-only">
                  Más de {product.association.name}
                </span>
              </h2>
              {otherProducts.length > MORE_PRODUCTS ? (
                <Link
                  href={associationHref}
                  className="text-primary inline-flex min-h-11 shrink-0 items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
                >
                  Ver los {associationProducts.length} productos
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              ) : null}
            </div>
            <div className="mt-8">
              <PlazaProductGrid
                products={otherProducts.slice(0, MORE_PRODUCTS)}
              />
            </div>
          </section>
        ) : null}
      </Container>
    </article>
  );
}
