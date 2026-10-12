import Link from "next/link";

import { AromaLogo } from "@/components/brand/aroma-logo";
import { buttonVariants } from "@/components/ui/button";
import { publicRoutes } from "@/lib/public-routes";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-1 items-center justify-center px-5 py-12">
      <div className="w-full max-w-lg space-y-6">
        <AromaLogo className="w-40" />
        <h1 className="text-brand-burgundy text-3xl font-semibold tracking-tight">
          Esta página no está disponible
        </h1>
        <p className="text-muted-foreground leading-7">
          Puedes volver al catálogo para conocer los productos de las
          asociaciones de AROMA.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={publicRoutes.products} className={buttonVariants()}>
            Ver productos
          </Link>
        </div>
      </div>
    </main>
  );
}
