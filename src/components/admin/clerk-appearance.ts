import type { SignIn } from "@clerk/nextjs";
import type { ComponentProps } from "react";

/** Clerk's sign-in and sign-up forms, in the admin's visual language. */
export const clerkAppearance = {
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
} satisfies ComponentProps<typeof SignIn>["appearance"];
