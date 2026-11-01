import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";
import { getSupportWhatsAppHref } from "@/lib/support";
import { getWhatsAppHref } from "@/lib/whatsapp";

type AssociationContactProps = {
  associationName: string;
  whatsappNumber: string | null;
  /** Prefilled first message, about a product or the association. */
  message: string;
  /** What happens after the click, shown under the button. */
  note: string;
};

/**
 * The commercial handoff: a WhatsApp conversation with the association, or
 * with the alliance when the association has no number published yet.
 */
function AssociationContact({
  associationName,
  whatsappNumber,
  message,
  note,
}: AssociationContactProps) {
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
        <p className="text-muted-foreground text-sm leading-relaxed">{note}</p>
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

export { AssociationContact };
