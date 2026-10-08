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
                "focus-visible:ring-ring/30 inline-flex h-9 items-center rounded-4xl border px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3",
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
