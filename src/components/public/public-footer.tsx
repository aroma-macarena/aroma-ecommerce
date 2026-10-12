import Link from "next/link";

import { AromaLogo } from "@/components/brand/aroma-logo";
import { Container } from "@/components/public/container";
import { publicNavigation, publicRoutes } from "@/lib/public-routes";

function PublicFooter() {
  return (
    <footer className="bg-muted border-t">
      <Container className="flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <AromaLogo className="w-32" />
          <p className="text-muted-foreground text-sm leading-6">
            Productos de las asociaciones que forman parte de la Alianza AROMA.
          </p>
        </div>

        <nav aria-label="Navegación del pie de página">
          <ul className="text-sm">
            {publicNavigation.map(({ href, label, available }) => (
              <li key={href}>
                {available ? (
                  <Link
                    href={href}
                    className="hover:text-primary inline-flex min-h-11 items-center rounded-md font-medium transition-colors"
                  >
                    {label}
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="text-muted-foreground inline-flex min-h-11 items-center gap-2"
                  >
                    {label}
                    <span className="text-xs">Próximamente</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      <Container className="text-muted-foreground flex flex-col gap-2 border-t py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Alianza AROMA</p>
        <Link
          href={publicRoutes.admin}
          className="hover:text-foreground inline-flex min-h-11 items-center rounded-md transition-colors"
        >
          Acceso administrativo
        </Link>
      </Container>
    </footer>
  );
}

export { PublicFooter };
