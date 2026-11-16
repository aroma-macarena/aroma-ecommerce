import { MapPin } from "lucide-react";
import Link from "next/link";

import { AromaLogo } from "@/components/brand/aroma-logo";
import { Container } from "@/components/public/container";
import {
  HeaderScrollSentinels,
  PublicHeaderFrame,
} from "@/components/public/public-header-frame";
import { PublicNav } from "@/components/public/public-nav";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { homeContent } from "@/content/home";
import { publicRoutes } from "@/lib/public-routes";
import { getAllianceWhatsAppNumber } from "@/lib/site-content/queries";
import { getWhatsAppHref } from "@/lib/whatsapp";

const contactMessage =
  "Hola, quiero saber más sobre los productos de la Alianza AROMA.";

/**
 * The public header: a thin utility strip with the alliance's place (wide
 * screens; it scrolls away), then the main bar with the logo,
 * the navigation in the middle and the contact action on the right. The
 * main bar stays on top, compact, once the page scrolls.
 */
async function PublicHeader() {
  const allianceNumber = await getAllianceWhatsAppNumber();
  const contactHref = getWhatsAppHref(allianceNumber, contactMessage);

  return (
    <>
      <HeaderScrollSentinels />
      <div className="text-muted-foreground hidden border-b text-sm md:block">
        <Container className="flex min-h-10 items-center">
          <p className="inline-flex items-center gap-2">
            <MapPin aria-hidden className="text-primary size-4" />
            {homeContent.hero.eyebrow}
          </p>
        </Container>
      </div>

      <PublicHeaderFrame>
        <Container className="flex h-16 items-center justify-between gap-3 transition-[height] duration-200 ease-out md:grid md:h-[5.0625rem] md:grid-cols-[1fr_auto_1fr] md:gap-6 md:group-data-scrolled/header:h-16 motion-reduce:transition-none">
          <Link
            href={publicRoutes.home}
            aria-label="Inicio de AROMA"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-self-start rounded-md"
          >
            <AromaLogo variant="symbol" className="w-10 min-[480px]:hidden" />
            <AromaLogo className="hidden w-28 transition-[width] duration-200 ease-out min-[480px]:block sm:w-32 md:w-36 md:group-data-scrolled/header:w-32 motion-reduce:transition-none" />
          </Link>

          <PublicNav />

          {/* Desktop only: on phones and tablets the bar keeps logo and links
              (the utility strip still offers the contact on tablets). */}
          <div className="hidden justify-self-end lg:block">
            {contactHref ? (
              <WhatsAppButton href={contactHref} priority="secondary">
                Contactar a la alianza
              </WhatsAppButton>
            ) : null}
          </div>
        </Container>
      </PublicHeaderFrame>
    </>
  );
}

export { PublicHeader };
