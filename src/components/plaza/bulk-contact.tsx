import { Container } from "@/components/public/container";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { getSupportWhatsAppHref } from "@/lib/support";

const message =
  "Hola, quiero comprar productos de la Alianza AROMA para mi negocio u organización. ¿Me pueden orientar?";

/**
 * Closing call for buyers who want volume: the alliance connects them with
 * the associations. Hidden when the alliance has no WhatsApp number.
 */
async function BulkContact() {
  const href = await getSupportWhatsAppHref(message);

  if (!href) {
    return null;
  }

  return (
    <section aria-labelledby="compras-volumen" className="bg-background">
      <Container className="flex flex-col gap-6 py-12 md:flex-row md:items-end md:justify-between md:gap-12 md:py-16">
        <div className="max-w-2xl space-y-3">
          <h2
            id="compras-volumen"
            className="font-editorial text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.02em] text-balance md:text-[3rem]"
          >
            ¿Compras para tu negocio u organización?
          </h2>
          <p className="text-lg leading-relaxed">
            Tiendas, restaurantes y entidades: escríbele a la Alianza AROMA y te
            pone en contacto con las asociaciones que tienen lo que buscas.
          </p>
        </div>
        <WhatsAppButton
          href={href}
          priority="primary"
          size="lg"
          className="w-full shrink-0 md:w-auto"
        >
          Escribir a la Alianza AROMA
        </WhatsAppButton>
      </Container>
    </section>
  );
}

export { BulkContact };
