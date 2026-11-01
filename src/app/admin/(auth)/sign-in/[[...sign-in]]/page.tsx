import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";

import { clerkAppearance } from "@/components/admin/clerk-appearance";
import { AromaLogo } from "@/components/brand/aroma-logo";

export const metadata: Metadata = {
  title: "Acceso administrativo",
};

export default async function Page() {
  return (
    <main className="flex min-h-svh flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <Link
          href="/"
          aria-label="Volver al inicio de AROMA"
          className="mx-auto flex min-h-11 w-fit max-w-full items-center rounded-md"
        >
          <AromaLogo className="w-40" />
        </Link>
        <SignIn appearance={clerkAppearance} />
        <Link
          href="/"
          className="text-muted-foreground hover:text-primary flex min-h-11 items-center justify-center rounded-md text-sm underline underline-offset-4"
        >
          Volver al sitio público
        </Link>
      </div>
    </main>
  );
}
