import Link from "next/link";

import { getProductsByCategoryHref, publicRoutes } from "@/lib/public-routes";
import { cn } from "@/lib/utils";

type CategoryFilterProps = {
  categories: { name: string; slug: string }[];
  activeSlug?: string;
};

function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
  const options = [
    { label: "Todos", href: publicRoutes.products, isActive: !activeSlug },
    ...categories.map(({ name, slug }) => ({
      label: name,
      href: getProductsByCategoryHref(slug),
      isActive: slug === activeSlug,
    })),
  ];

  return (
    <nav aria-label="Filtrar por categoría">
      <ul className="flex flex-wrap gap-2">
        {options.map(({ label, href, isActive }) => (
          <li key={href}>
            <Link
              href={href}
              scroll={false}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-background hover:bg-muted",
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export { CategoryFilter };
