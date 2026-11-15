import { getAllianceWhatsAppNumber } from "@/lib/site-content/queries";
import { getWhatsAppHref } from "@/lib/whatsapp";

/**
 * WhatsApp link to the alliance administration, prefilled with context.
 * The number is managed in "Contenido"; null when there is none.
 */
export async function getSupportWhatsAppHref(message: string) {
  return getWhatsAppHref(await getAllianceWhatsAppNumber(), message);
}
