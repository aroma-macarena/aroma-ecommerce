import { getWhatsAppHref } from "@/lib/whatsapp";

/**
 * WhatsApp link to the alliance administration, prefilled with context.
 * Returns null until ALLIANCE_SUPPORT_WHATSAPP is configured.
 */
export function getSupportWhatsAppHref(message: string) {
  return getWhatsAppHref(process.env.ALLIANCE_SUPPORT_WHATSAPP, message);
}
