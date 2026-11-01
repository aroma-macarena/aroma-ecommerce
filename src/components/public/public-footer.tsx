import Link from "next/link";

import { AromaLogo } from "@/components/brand/aroma-logo";
import { Container } from "@/components/public/container";
import { publicNavigation, publicRoutes } from "@/lib/public-routes";
import { toParagraphs } from "@/lib/site-content/blocks";
import { getSiteContent } from "@/lib/site-content/queries";

async function PublicFooter() {
  const { footer_about: about } = await getSiteContent();

  return (
    <footer className="bg-card border-t">
      <Container className="flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl space-y-3">
          <AromaLogo className="w-32" />
          {toParagraphs(about.content).map((paragraph, index) => (
            <p key={index} className="text-muted-foreground text-sm leading-6">
              {paragraph}
            </p>
          ))}
        </div>

        <nav aria-label="Navegación del pie de página">
          <ul className="flex flex-wrap gap-x-6 text-sm md:block">
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

      <Container className="text-muted-foreground flex flex-wrap items-center justify-between gap-x-4 border-t py-4 text-xs">
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
