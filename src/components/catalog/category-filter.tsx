import Link from "next/link";

import { cn } from "@/lib/utils";

type CategoryFilterProps = {
  categories: { name: string; slug: string }[];
  activeSlug?: string;
  /** Builds each option's address (the page decides where the filter lives). */
  getHref: (categorySlug: string | undefined) => string;
};

/** One chip per category; the current one is filled in ink. */
function CategoryFilter({
  categories,
  activeSlug,
  getHref,
}: CategoryFilterProps) {
  const options = [
    { label: "Todos", href: getHref(undefined), isActive: !activeSlug },
    ...categories.map(({ name, slug }) => ({
      label: name,
      href: getHref(slug),
      isActive: slug === activeSlug,
    })),
  ];

  return (
    <nav
      aria-label="Filtrar por categoría"
      className="rail-scroll -mx-5 px-5 pb-1 sm:mx-0 sm:px-0"
    >
      <ul className="flex gap-2 whitespace-nowrap">
        {options.map(({ label, href, isActive }) => (
          <li key={href}>
            <Link
              href={href}
              scroll={false}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-4 text-[0.9375rem] font-semibold transition-colors",
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "bg-card hover:border-foreground",
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
