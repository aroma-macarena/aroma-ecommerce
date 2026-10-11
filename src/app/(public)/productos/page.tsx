import { redirect } from "next/navigation";

import { getProductsByCategoryHref, publicRoutes } from "@/lib/public-routes";

export default async function ProductsPage({
  searchParams,
}: PageProps<"/productos">) {
  const { categoria } = await searchParams;
  redirect(
    typeof categoria === "string" && categoria
      ? getProductsByCategoryHref(categoria)
      : publicRoutes.products,
  );
}
