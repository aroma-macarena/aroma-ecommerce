export const publicRoutes = {
  home: "/",
  products: "/productos",
  associations: "/asociaciones",
  admin: "/admin",
} as const;

export const publicNavigation = [
  { href: publicRoutes.products, label: "Productos" },
  { href: publicRoutes.associations, label: "Asociaciones" },
] as const;

export function getProductsByCategoryHref(categorySlug: string) {
  return `${publicRoutes.products}?categoria=${encodeURIComponent(categorySlug)}`;
}

export function getProductDetailHref(
  associationSlug: string,
  productSlug: string,
) {
  return `${publicRoutes.products}/${associationSlug}/${productSlug}`;
}
