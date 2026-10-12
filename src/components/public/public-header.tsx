import Link from "next/link";

import { AromaLogo } from "@/components/brand/aroma-logo";
import { Container } from "@/components/public/container";
import { PublicNav } from "@/components/public/public-nav";
import { publicRoutes } from "@/lib/public-routes";

function PublicHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 border-b">
      <Container className="flex min-h-20 flex-wrap items-center justify-between gap-3 py-3">
        <Link
          href={publicRoutes.home}
          aria-label="Inicio de AROMA"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center rounded-md"
        >
          <AromaLogo variant="symbol" className="w-10 min-[400px]:hidden" />
          <AromaLogo className="hidden w-28 min-[400px]:block sm:w-36" />
        </Link>

        <PublicNav />
      </Container>
    </header>
  );
}

export { PublicHeader };
