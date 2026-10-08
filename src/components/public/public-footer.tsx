import Link from "next/link";

import { AromaLogo } from "@/components/brand/aroma-logo";
import { Container } from "@/components/public/container";
import { publicNavigation, publicRoutes } from "@/lib/public-routes";

function PublicFooter() {
  return (
    <footer className="bg-muted/40 border-t">
      <Container className="flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <AromaLogo className="w-32" sizes="128px" />
          <p className="text-muted-foreground text-sm leading-6">
            Productos de las asociaciones que forman parte de la Alianza AROMA.
          </p>
        </div>

        <nav aria-label="Navegación del pie de página">
          <ul className="space-y-2 text-sm">
            {publicNavigation.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="hover:text-primary font-medium transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      <Container className="text-muted-foreground flex flex-col gap-2 border-t py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Alianza AROMA</p>
        <Link
          href={publicRoutes.admin}
          className="hover:text-foreground transition-colors"
        >
          Acceso administrativo
        </Link>
      </Container>
    </footer>
  );
}

export { PublicFooter };
