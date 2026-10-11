import type { Metadata } from "next";
import Link from "next/link";

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
  const { hero, about } = homeContent;

  return (
    <>
      <Section className="pt-8 pb-12 md:pt-12 md:pb-16">
        <Container className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-primary text-sm font-medium">{hero.eyebrow}</p>
            <SectionHeading
              as="h1"
              title={hero.title}
              description={hero.description}
            />
          </div>

          <section aria-labelledby="catalogo-titulo" className="space-y-6">
            <h2
              id="catalogo-titulo"
              className="text-2xl font-semibold tracking-tight"
            >
              Explora los productos
            </h2>
            {categories.length > 0 ? (
              <CategoryFilter
                categories={categories}
                activeSlug={categorySlug}
              />
            ) : null}

            {products.length > 0 ? (
              <>
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <li key={product.id} className="min-w-0">
                      <ProductCard product={product} />
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                  Las fichas detalladas y el contacto directo con las
                  asociaciones estarán disponibles próximamente.
                </p>
              </>
            ) : (
              <div className="bg-muted rounded-xl border px-4 py-8 text-center">
                <p className="font-heading text-lg font-medium">
                  {categorySlug
                    ? "No hay productos en esta categoría"
                    : "Aún no hay productos disponibles"}
                </p>
                <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
                  {categorySlug
                    ? "Prueba con otra categoría o consulta todos los productos disponibles."
                    : "Pronto encontrarás aquí los productos de las asociaciones de AROMA."}
                </p>
                {categorySlug ? (
                  <Link
                    href={publicRoutes.products}
                    className={buttonVariants({
                      variant: "outline",
                      className: "mt-6",
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

      <Section id="alianza" className="bg-muted border-y scroll-mt-40">
        <Container className="grid gap-8 md:grid-cols-2 md:gap-16">
          <SectionHeading title={about.title} description={about.description} />
          <ul className="space-y-6">
            {about.highlights.map(({ title, description }) => (
              <li key={title} className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
