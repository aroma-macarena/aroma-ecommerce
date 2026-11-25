import type { Metadata } from "next";
import Link from "next/link";

import { CategoryFilter } from "@/components/catalog/category-filter";
import { AllianceBoard } from "@/components/plaza/alliance-board";
import { BulkContact } from "@/components/plaza/bulk-contact";
import { FeaturedCard } from "@/components/plaza/featured-card";
import { HeroCarousel, type HeroSlide } from "@/components/plaza/hero-carousel";
import { HowToBuy } from "@/components/plaza/how-to-buy";
import { PlazaProductGrid } from "@/components/plaza/plaza-product-card";
import {
  ProducerRail,
  type RailProducer,
} from "@/components/plaza/producer-rail";
import { Container } from "@/components/public/container";
import { buttonVariants } from "@/components/ui/button";
import {
  getCatalogCategories,
  getCatalogProducts,
  getPublicAssociations,
  getPublicProduct,
} from "@/lib/catalog/queries";
import { getMediaUrl } from "@/lib/media";
import { getAssociationHref, publicRoutes } from "@/lib/public-routes";
import { getSiteContent } from "@/lib/site-content/queries";

export const metadata: Metadata = {
  title: { absolute: "Productos de La Macarena | Alianza AROMA" },
  description:
    "Conoce los productos de las organizaciones y mujeres productoras de la Alianza AROMA, en La Macarena, Meta.",
};

/** Home address with the chosen category. */
function getHomeHref(categoria?: string) {
  return categoria
    ? `${publicRoutes.home}?${new URLSearchParams({ categoria })}`
    : publicRoutes.home;
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const { categoria } = await searchParams;
  const categorySlug = typeof categoria === "string" ? categoria : undefined;

  const [categories, allProducts, associations, content] = await Promise.all([
    getCatalogCategories(),
    getCatalogProducts(),
    getPublicAssociations(),
    getSiteContent(),
  ]);

  // The hero carousel: one featured product per organization, its latest
  // one, organizations ordered by their latest publication.
  const latestPerAssociation = allProducts.filter(
    (product, position) =>
      allProducts.findIndex(
        (other) => other.associationSlug === product.associationSlug,
      ) === position,
  );
  const featured = (
    await Promise.all(
      latestPerAssociation.map(({ associationSlug, slug }) =>
        getPublicProduct(associationSlug, slug),
      ),
    )
  ).filter((product) => product !== null);
  const featuredProduct = featured[0] ?? null;
  const productCountOf = (slug: string) =>
    associations.find((association) => association.slug === slug)
      ?.productCount ?? 1;
  const slides: HeroSlide[] = featured.map((product) => {
    const [image] = product.images;
    return {
      id: product.id,
      label: `${product.name}, de ${product.association.name}`,
      // The horizontal banner when the product has one; otherwise the
      // primary photo, cropped to the carousel.
      imageUrl:
        getMediaUrl(product.bannerObjectKey) ??
        getMediaUrl(image?.objectKey ?? null),
      imageAlt: image?.altText ?? product.name,
      card: (
        <FeaturedCard
          product={product}
          productCount={productCountOf(product.association.slug)}
        />
      ),
    };
  });

  // The grid leaves out the product already featured above, unless a
  // category is chosen, so the same product never shows twice in a row.
  const products = categorySlug
    ? allProducts.filter((product) => product.categorySlug === categorySlug)
    : allProducts.filter((product) => product.id !== featuredProduct?.id);
  const onlyFeatured = !categorySlug && allProducts.length === 1;

  const producers: RailProducer[] = associations
    .filter(({ productCount }) => productCount > 0)
    .map((association) => ({
      slug: association.slug,
      name: association.name,
      location: association.location,
      logoObjectKey: association.logoObjectKey,
      coverObjectKey: association.coverObjectKey,
      productCount: association.productCount,
      href: getAssociationHref(association.slug),
    }));

  return (
    <>
      {slides.length > 0 ? (
        <HeroCarousel
          title={content.home_hero.title}
          lead={content.home_hero.content}
          slides={slides}
        />
      ) : (
        <Container className="grid gap-2 pt-4 pb-4 sm:gap-3 sm:pt-6 sm:pb-6 md:pt-8 md:pb-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h1 className="font-sign text-[2.75rem] leading-[0.88] text-balance uppercase wrap-anywhere sm:text-[4.5rem] lg:col-span-8 lg:text-[4.75rem]">
            {content.home_hero.title}
          </h1>
          <p className="font-editorial text-muted-foreground max-w-[48ch] text-base leading-relaxed sm:text-lg md:text-xl lg:col-span-4 lg:pb-1">
            {content.home_hero.content}
          </p>
        </Container>
      )}

      {producers.length > 1 ? <ProducerRail producers={producers} /> : null}

      <section
        aria-labelledby="catalogo-titulo"
        className="pt-8 pb-12 md:pt-10 md:pb-20"
      >
        <Container className="space-y-8">
          <div className="flex flex-col gap-5 border-b pb-5 md:flex-row md:items-end md:justify-between md:gap-8">
            <h2
              id="catalogo-titulo"
              className="font-sign text-[2.5rem] leading-[0.92] uppercase md:text-[3.25rem]"
            >
              Explora los productos
            </h2>
            {categories.length > 0 ? (
              <CategoryFilter
                categories={categories}
                activeSlug={categorySlug}
                getHref={(slug) => getHomeHref(slug)}
              />
            ) : null}
          </div>

          {onlyFeatured ? (
            <p className="font-editorial text-muted-foreground text-lg">
              Por ahora el producto destacado es el único publicado; pronto
              habrá más de las asociaciones de AROMA.
            </p>
          ) : products.length > 0 ? (
            <PlazaProductGrid products={products} />
          ) : (
            <div className="max-w-xl space-y-2 py-4">
              <p className="font-editorial text-2xl font-semibold">
                {categorySlug
                  ? "No hay productos en esta categoría"
                  : "Aún no hay productos disponibles"}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {categorySlug
                  ? "Prueba con otra categoría o consulta todos los productos disponibles."
                  : "Pronto encontrarás aquí los productos de las asociaciones de AROMA."}
              </p>
              {categorySlug ? (
                <Link
                  href={getHomeHref()}
                  scroll={false}
                  className={buttonVariants({ size: "lg", className: "mt-4" })}
                >
                  Ver todos los productos
                </Link>
              ) : null}
            </div>
          )}
        </Container>
      </section>

      <HowToBuy />

      <AllianceBoard
        title={content.home_alliance.title}
        description={content.home_alliance.content}
      />

      <BulkContact />
    </>
  );
}
