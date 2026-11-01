export const publicRoutes = {
  home: "/",
  products: "/",
  associations: "/asociaciones",
  admin: "/admin",
} as const;

export const publicNavigation = [
  {
    href: publicRoutes.products,
    label: "Productos",
    available: true,
    // Product details live under /productos/ but belong to this section.
    sectionPrefix: "/productos/",
  },
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

/** Absolute URL for a path, or null until NEXT_PUBLIC_SITE_URL is set. */
export function getAbsoluteUrl(path: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  return siteUrl ? `${siteUrl}${path}` : null;
}
