export const publicRoutes = {
  home: "/",
  products: "/",
  associations: "/asociaciones",
  admin: "/admin",
} as const;

export const publicNavigation = [
  { href: publicRoutes.products, label: "Productos", available: true },
  { href: "/#alianza", label: "La alianza", available: true },
] as const;

export function getProductsByCategoryHref(categorySlug: string) {
  return `${publicRoutes.products}?categoria=${encodeURIComponent(categorySlug)}`;
}

export function getProductDetailHref(
  associationSlug: string,
  productSlug: string,
) {
  return `/productos/${associationSlug}/${productSlug}`;
}
