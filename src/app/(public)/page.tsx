import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import territoryImage from "@/assets/territorio-rio-guayabero.jpg";
import { CategoryFilter } from "@/components/catalog/category-filter";
import { ProductCard } from "@/components/catalog/product-card";
import { Container } from "@/components/public/container";
import { Section } from "@/components/public/section";
import { SectionHeading } from "@/components/public/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { homeContent } from "@/content/home";
import {
  getCatalogCategories,
  getCatalogProducts,
} from "@/lib/catalog/queries";
import { publicRoutes } from "@/lib/public-routes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Vitrina comercial",
  description:
    "Conoce los productos de las organizaciones y mujeres productoras de la Alianza AROMA, en La Macarena, Meta.",
};

export default async function Home({ searchParams }: PageProps<"/">) {
  const { categoria } = await searchParams;
  const categorySlug = typeof categoria === "string" ? categoria : undefined;
  const [categories, products] = await Promise.all([
    getCatalogCategories(),
    getCatalogProducts(categorySlug),
  ]);
  const { hero, alliance } = homeContent;

  const facts = [
    { label: "organizaciones", value: alliance.organizations.length },
    {
      label: "mujeres productoras",
      value: alliance.organizations.reduce(
        (total, { women }) => total + women,
        0,
      ),
    },
    ...(categories.length > 0
      ? [
          {
            label: categories.length === 1 ? "categoría" : "categorías",
            value: categories.length,
          },
        ]
      : []),
  ];

  return (
    <>
      <Section className="pt-8 pb-16 md:pt-14 md:pb-24">
        <Container className="space-y-16 md:space-y-24">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16">
            <div className="flex flex-col gap-8 lg:justify-center lg:gap-10">
              <SectionHeading
                as="h1"
                eyebrow={hero.eyebrow}
                title={hero.title}
                description={hero.description}
              />

              <dl
                className={cn(
                  "border-foreground grid border-t-[1.5px] border-b",
                  facts.length === 3 ? "grid-cols-3" : "grid-cols-2",
                )}
              >
                {facts.map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex min-w-0 flex-col-reverse justify-end gap-1 border-l py-3 pl-3 first:border-l-0 first:pl-0 sm:pl-5"
                  >
                    <dt className="text-muted-foreground text-sm leading-snug">
                      {label}
                    </dt>
                    <dd className="font-heading text-3xl leading-none font-semibold md:text-[2.75rem]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <figure className="space-y-2">
              <Image
                src={territoryImage}
                alt={hero.image.alt}
                placeholder="blur"
                priority
                sizes="(min-width: 1024px) 28rem, (min-width: 640px) 80vw, 100vw"
                className="aspect-4/3 w-full rounded-sm object-cover lg:aspect-square"
              />
              <figcaption className="text-muted-foreground font-mono text-xs">
                {hero.image.caption}
              </figcaption>
            </figure>
          </div>

          <section aria-labelledby="catalogo-titulo" className="space-y-8">
            <div className="flex flex-col gap-2 border-b md:flex-row md:items-end md:justify-between md:gap-8">
              <h2
                id="catalogo-titulo"
                className="font-heading text-3xl leading-tight font-semibold tracking-[-0.03em] md:pb-2 md:text-[2.5rem]"
              >
                Explora los productos
              </h2>
              {categories.length > 0 ? (
                <CategoryFilter
                  categories={categories}
                  activeSlug={categorySlug}
                />
              ) : null}
            </div>

            {products.length > 0 ? (
              <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <li key={product.id} className="min-w-0">
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="max-w-xl space-y-2 py-4">
                <p className="font-heading text-2xl font-medium">
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
                    href={publicRoutes.products}
                    className={buttonVariants({
                      variant: "outline",
                      className: "mt-4",
                    })}
                  >
                    Ver todos los productos
                  </Link>
                ) : null}
              </div>
            )}
          </section>
        </Container>
      </Section>

      <Section
        id="alianza"
        className="bg-brand-burgundy text-background scroll-mt-24"
      >
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <div className="flex flex-col gap-10">
            <SectionHeading
              eyebrow={alliance.eyebrow}
              title={alliance.title}
              description={alliance.description}
              tone="inverse"
            />
            <Image
              src="/brand/aroma-sello.svg"
              alt="Sello: Producto de la Alianza AROMA, hecho por mujeres campesinas"
              width={1525}
              height={1525}
              unoptimized
              className="mx-auto w-40 sm:w-48 lg:my-auto lg:w-56"
            />
          </div>

          <ul className="border-background/25 grid content-start border-b sm:grid-cols-2 sm:gap-x-8">
            {alliance.organizations.map((organization) => (
              <li
                key={organization.acronym}
                className="border-background/25 space-y-1 border-t py-3.5"
              >
                <p className="flex justify-between gap-3 font-mono text-[0.8125rem] font-medium">
                  <span>{organization.acronym}</span>
                  <span className="text-background/80 text-right">
                    {organization.women} mujeres
                    {"men" in organization
                      ? ` y ${organization.men} hombres`
                      : ""}
                  </span>
                </p>
                <p className="text-background/80 text-sm leading-snug">
                  {organization.name}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
