import type { Metadata } from "next";
import Link from "next/link";

import { CategoryFilter } from "@/components/catalog/category-filter";
import { ProductCard } from "@/components/catalog/product-card";
import { Container } from "@/components/public/container";
import { Section } from "@/components/public/section";
import { SectionHeading } from "@/components/public/section-heading";
import { buttonVariants } from "@/components/ui/button";
import {
  getCatalogCategories,
  getCatalogProducts,
} from "@/lib/catalog/queries";
import { publicRoutes } from "@/lib/public-routes";

export const metadata: Metadata = {
  title: "Productos",
  description: "Productos de las asociaciones que forman parte de AROMA.",
};

export default async function ProductsPage({
  searchParams,
}: PageProps<"/productos">) {
  const { categoria } = await searchParams;
  const categorySlug = typeof categoria === "string" ? categoria : undefined;

  const [categories, products] = await Promise.all([
    getCatalogCategories(),
    getCatalogProducts(categorySlug),
  ]);

  return (
    <Section>
      <Container className="space-y-8">
        <SectionHeading
          title="Productos"
          description="Conoce los productos elaborados por las asociaciones de AROMA."
        />

        {categories.length > 0 ? (
          <CategoryFilter categories={categories} activeSlug={categorySlug} />
        ) : null}

        {products.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-muted/40 rounded-4xl border border-dashed px-6 py-12 text-center">
            <p className="font-heading text-lg font-medium">
              {categorySlug
                ? "No hay productos en esta categoría"
                : "Aún no hay productos disponibles"}
            </p>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
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
      </Container>
    </Section>
  );
}
