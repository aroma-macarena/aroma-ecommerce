import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Bricolage_Grotesque,
  Geist,
  Geist_Mono,
  Source_Serif_4,
} from "next/font/google";

import { clerkLocalization } from "@/lib/clerk-localization";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  axes: ["opsz"],
});

// Public site: a variable grotesque, condensed for headlines and figures.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
});

// Public site: editorial serif for product and organization names.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "latin-ext"],
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
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} ${archivo.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider afterSignOutUrl="/" localization={clerkLocalization}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
