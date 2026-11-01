import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";
import { getSupportWhatsAppHref } from "@/lib/support";
import { getProductInquiryMessage, getWhatsAppHref } from "@/lib/whatsapp";

type ProductContactProps = {
  productName: string;
  associationName: string;
  whatsappNumber: string | null;
  productUrl: string | null;
};

/**
 * The commercial handoff: a WhatsApp conversation with the association, or
 * with the alliance when the association has no number published yet.
 */
function ProductContact({
  productName,
  associationName,
  whatsappNumber,
  productUrl,
}: ProductContactProps) {
  const message = getProductInquiryMessage({
    productName,
    associationName,
    productUrl,
  });
  const associationHref = getWhatsAppHref(whatsappNumber, message);
  const allianceHref = associationHref
    ? null
    : getSupportWhatsAppHref(
        `${message}\n\n${associationName} aún no tiene un WhatsApp publicado. ¿Me pueden poner en contacto?`,
      );

  if (associationHref) {
    return (
      <div className="space-y-3">
        <a
          href={associationHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({
            size: "lg",
            className: "w-full sm:w-auto",
          })}
        >
          <WhatsAppIcon />
          Consultar por WhatsApp
          <span className="sr-only">(se abre en una nueva pestaña)</span>
        </a>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Se abre WhatsApp con un mensaje listo sobre este producto. La
          conversación sigue directamente con la asociación: AROMA no procesa
          pagos ni pedidos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        <span className="font-semibold">
          {associationName} aún no tiene un WhatsApp publicado.
        </span>{" "}
        {allianceHref
          ? "La Alianza AROMA puede ponerte en contacto con la asociación."
          : "Pronto podrás escribirle directamente desde aquí."}
      </p>
      {allianceHref ? (
        <a
          href={allianceHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "w-full sm:w-auto",
          })}
        >
          <WhatsAppIcon />
          Escribir a la Alianza AROMA
          <span className="sr-only">(se abre en una nueva pestaña)</span>
        </a>
      ) : null}
    </div>
  );
}

export { ProductContact };
