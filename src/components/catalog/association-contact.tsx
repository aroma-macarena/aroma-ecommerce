import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { getSupportWhatsAppHref } from "@/lib/support";
import {
  getAllianceProductInquiryMessage,
  getProductInquiryMessage,
  getWhatsAppHref,
} from "@/lib/whatsapp";

type AssociationContactProps = {
  associationName: string;
  whatsappNumber: string | null;
  productName: string;
  /** Absolute product URL, added to the prefilled message. */
  productUrl?: string | null;
  /** What happens after the click, shown under the button. */
  note: string;
  /**
   * Off where space is short (the home's featured card): the button stands
   * alone, without the note or the "no WhatsApp yet" explanation. With no
   * button to show at all, the explanation still appears.
   */
  showNotes?: boolean;
  /** The button spans its container at every width (the featured card). */
  fullWidth?: boolean;
};

/**
 * The product's commercial handoff, always the same button: a WhatsApp
 * conversation with the association, or with the alliance (naming the
 * product and the association) when the association has no number yet.
 */
async function AssociationContact({
  associationName,
  whatsappNumber,
  productName,
  productUrl,
  note,
  showNotes = true,
  fullWidth = false,
}: AssociationContactProps) {
  const associationHref = getWhatsAppHref(
    whatsappNumber,
    getProductInquiryMessage({ productName, associationName, productUrl }),
  );
  const href =
    associationHref ??
    (await getSupportWhatsAppHref(
      getAllianceProductInquiryMessage({
        productName,
        associationName,
        productUrl,
      }),
    ));

  return (
    <div className="space-y-3">
      {href ? (
        <WhatsAppButton
          href={href}
          priority="primary"
          size="lg"
          className={fullWidth ? "w-full" : "w-full sm:w-auto"}
        >
          Consultar por WhatsApp
        </WhatsAppButton>
      ) : null}
      {associationHref ? (
        showNotes ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {note}
          </p>
        ) : null
      ) : showNotes || !href ? (
        <p className="text-muted-foreground text-sm leading-relaxed">
          <span className="text-foreground font-semibold">
            {associationName} aún no tiene un WhatsApp publicado.
          </span>{" "}
          {href
            ? "La Alianza AROMA puede ponerte en contacto con la asociación."
            : "Pronto podrás escribirle directamente desde aquí."}
        </p>
      ) : null}
    </div>
  );
}

export { AssociationContact };
