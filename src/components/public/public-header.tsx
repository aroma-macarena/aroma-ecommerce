import Link from "next/link";

import { AromaLogo } from "@/components/brand/aroma-logo";
import { Container } from "@/components/public/container";
import { publicNavigation, publicRoutes } from "@/lib/public-routes";

function PublicHeader() {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href={publicRoutes.home} aria-label="Inicio de AROMA">
          <AromaLogo
            className="w-28 sm:w-36"
            sizes="(min-width: 640px) 144px, 112px"
          />
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="flex items-center gap-1 sm:gap-2">
            {publicNavigation.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="hover:bg-muted focus-visible:ring-ring/30 rounded-4xl px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}

export { PublicHeader };
