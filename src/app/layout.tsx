import "./globals.css";

import { esMX } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  axes: ["opsz"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: "Alianza AROMA",
    template: "%s | Alianza AROMA",
  },
  description:
    "Productos de las organizaciones de mujeres campesinas de la Alianza AROMA, en La Macarena, Meta.",
  applicationName: "Alianza AROMA",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Alianza AROMA",
    title: "Productos de La Macarena | Alianza AROMA",
    description:
      "Conoce los productos de las organizaciones de mujeres campesinas de la Alianza AROMA, en La Macarena, Meta.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#fffdf8",
};

// Fixes a typo in Clerk's es-MX translation ("rquerido").
const clerkLocalization = {
  ...esMX,
  unstable__errors: {
    ...esMX.unstable__errors,
    form_param_nil: "Este campo es obligatorio.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider afterSignOutUrl="/" localization={clerkLocalization}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
