/**
 * WhatsApp link to the alliance administration, prefilled with context.
 * Returns null until ALLIANCE_SUPPORT_WHATSAPP is configured.
 */
export function getSupportWhatsAppHref(message: string) {
  const phoneNumber = process.env.ALLIANCE_SUPPORT_WHATSAPP?.replace(/\D/g, "");

  if (!phoneNumber) {
    return null;
  }

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
