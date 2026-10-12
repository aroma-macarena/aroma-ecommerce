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
    <nav
      aria-label="Filtrar por categoría"
      className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0"
    >
      <ul className="flex gap-6 whitespace-nowrap">
        {options.map(({ label, href, isActive }) => (
          <li key={href}>
            <Link
              href={href}
              scroll={false}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex min-h-12 items-center text-[0.9375rem] transition-colors focus-visible:outline-offset-[-2px]",
                isActive
                  ? "text-foreground shadow-[inset_0_-3px_0_var(--brand-orange)] font-semibold"
                  : "text-muted-foreground hover:text-foreground font-medium",
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
