import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";

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
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "var(--primary)",
              colorBackground: "var(--card)",
              colorForeground: "var(--foreground)",
              colorMutedForeground: "var(--muted-foreground)",
              fontFamily: "var(--font-geist-sans), sans-serif",
              borderRadius: "var(--radius)",
            },
            elements: {
              rootBox: "w-full! max-w-full!",
              cardBox:
                "w-full! max-w-full! shadow-none! border! border-border! rounded-lg!",
              card: "w-full! min-w-0! gap-6! px-4! py-6! shadow-none! border-0! rounded-lg!",
              headerTitle:
                "font-heading! text-foreground! text-2xl! font-semibold! tracking-[-0.02em]!",
              formFieldInput:
                "min-h-11! min-w-0! w-full! rounded-md! border! border-input! text-base! shadow-none! focus-visible:outline-2! focus-visible:outline-offset-4! focus-visible:outline-ring!",
              formButtonPrimary:
                "h-auto! min-h-11! max-w-full! gap-2! px-3! py-3! whitespace-normal! rounded-md! bg-primary! bg-none! hover:bg-primary/90! shadow-none! text-sm! font-semibold! focus-visible:outline-2! focus-visible:outline-offset-4! focus-visible:outline-ring! [&::after]:shadow-none! [&::after]:bg-none!",
              // Clerk uses this element for both "Restablece tu contraseña" and
              // the alternative sign-in methods; only the latter contain a text
              // element, so the reset action gets the primary button style.
              alternativeMethodsBlockButton:
                "min-h-11! rounded-md! shadow-none! bg-none! focus-visible:outline-2! focus-visible:outline-offset-4! focus-visible:outline-ring! [&::after]:shadow-none! [&::after]:bg-none! [&:not(:has(.cl-alternativeMethodsBlockButtonText))]:bg-primary! [&:not(:has(.cl-alternativeMethodsBlockButtonText))]:text-primary-foreground! [&:not(:has(.cl-alternativeMethodsBlockButtonText))]:hover:bg-primary/90! [&:not(:has(.cl-alternativeMethodsBlockButtonText))]:font-semibold!",
              // Generic Clerk buttons, such as "Soporte de correo electrónico":
              // keep their colors and only drop the gradient and shine.
              button:
                "rounded-md! shadow-none! bg-none! [&::after]:shadow-none! [&::after]:bg-none!",
              footer: "bg-muted! rounded-b-lg!",
            },
          }}
        />
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
