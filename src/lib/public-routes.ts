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
