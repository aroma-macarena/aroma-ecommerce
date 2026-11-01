import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ProductContact } from "@/components/catalog/product-contact";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductPresentations } from "@/components/catalog/product-presentations";
import { Container } from "@/components/public/container";
import { getPublicProduct } from "@/lib/catalog/queries";
import { getMediaUrl } from "@/lib/media";
import {
  getAbsoluteUrl,
  getProductDetailHref,
  getProductsByCategoryHref,
  publicRoutes,
} from "@/lib/public-routes";

type ProductPageProps = PageProps<"/productos/[association]/[product]">;

// Metadata and the page share one query per request.
const findProduct = cache(getPublicProduct);

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

function OriginRow({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <div className="grid gap-1 border-b py-3 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-muted-foreground font-mono text-xs tracking-[0.06em] uppercase sm:pt-0.5">
        {label}
      </dt>
      <dd className="wrap-anywhere">{value}</dd>
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
        className="font-heading text-2xl font-semibold tracking-[-0.02em]"
      >
        {title}
      </h2>
      <p className="max-w-prose leading-relaxed whitespace-pre-line">{text}</p>
    </section>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { association, product: productSlug } = await params;
  const product = await findProduct(association, productSlug);

  if (!product) {
    notFound();
  }

  const productUrl = getAbsoluteUrl(
    getProductDetailHref(product.association.slug, product.slug),
  );

  return (
    <article aria-labelledby="producto-titulo">
      <Container className="space-y-12 pt-6 pb-16 md:space-y-20 md:pt-10 md:pb-24">
        <div className="space-y-6 md:space-y-8">
          <nav aria-label="Ruta" className="text-sm">
            <ol className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link
                  href={publicRoutes.products}
                  className="hover:text-foreground inline-flex min-h-11 items-center gap-1.5 font-medium transition-colors"
                >
                  <ArrowLeft aria-hidden className="size-4" />
                  Productos
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={getProductsByCategoryHref(product.categorySlug)}
                  className="hover:text-foreground inline-flex min-h-11 items-center font-medium transition-colors"
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

            <div className="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-3 wrap-anywhere">
                <p className="text-primary font-mono text-xs font-medium tracking-[0.08em] uppercase">
                  {product.categoryName}
                </p>
                <h1
                  id="producto-titulo"
                  className="font-heading text-4xl leading-[1.02] font-semibold tracking-[-0.035em] text-balance md:text-5xl"
                >
                  {product.name}
                </h1>
                <p className="font-mono text-[0.8125rem]">
                  {product.association.name}
                  {product.association.location
                    ? ` · ${product.association.location}`
                    : null}
                </p>
                {product.shortDescription ? (
                  <p className="text-muted-foreground pt-2 text-lg leading-relaxed">
                    {product.shortDescription}
                  </p>
                ) : null}
              </div>

              <ProductPresentations presentations={product.presentations} />

              <ProductContact
                productName={product.name}
                associationName={product.association.name}
                whatsappNumber={product.association.whatsappNumber}
                productUrl={productUrl}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <section
            aria-labelledby="origen-titulo"
            className="border-foreground bg-card self-start rounded-md border-[1.5px] p-5 md:p-6"
          >
            <h2
              id="origen-titulo"
              className="font-mono text-xs font-medium tracking-[0.08em] uppercase"
            >
              Etiqueta de origen
            </h2>
            <dl className="border-foreground mt-3 border-t-[1.5px]">
              <OriginRow
                label="Organización"
                value={product.association.name}
              />
              <OriginRow label="Origen" value={product.origin} />
              <OriginRow label="Categoría" value={product.categoryName} />
              <OriginRow
                label="Disponibilidad"
                value={product.availabilityNote}
              />
            </dl>
            {product.association.description ? (
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
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
      </Container>
    </article>
  );
}
