import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";

import { clerkAppearance } from "@/components/admin/clerk-appearance";
import { AromaLogo } from "@/components/brand/aroma-logo";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Crear acceso administrativo",
};

/**
 * Where Clerk invitations land. Access is by invitation only: without the
 * invitation's ticket the page explains that instead of offering a sign-up
 * form. Clerk's restricted sign-up mode enforces the same rule on its side.
 */
export default async function Page({
  searchParams,
}: PageProps<"/admin/sign-up/[[...sign-up]]">) {
  const { __clerk_ticket: ticket } = await searchParams;
  const hasInvitation = typeof ticket === "string" && ticket.length > 0;

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
        {hasInvitation ? (
          <SignUp appearance={clerkAppearance} />
        ) : (
          <div className="space-y-4 rounded-lg border px-4 py-6">
            <h1 className="font-heading text-2xl font-semibold tracking-[-0.02em]">
              El acceso es solo por invitación
            </h1>
            <p className="text-muted-foreground text-sm leading-6">
              Las cuentas del panel las crea la alianza AROMA. Si te invitaron,
              abre el enlace del correo de invitación. Si ya tienes acceso,
              inicia sesión.
            </p>
            <Link
              href="/admin/sign-in"
              className={buttonVariants({ className: "w-full" })}
            >
              Iniciar sesión
            </Link>
          </div>
        )}
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
