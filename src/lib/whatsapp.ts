/**
 * Digits of a WhatsApp number with its country code. A 10-digit Colombian
 * mobile number (starting with 3) gets the 57 code; anything too short to be
 * a phone number is treated as missing.
 */
export function normalizeWhatsAppNumber(value: string | null | undefined) {
  const digits = value?.replace(/\D/g, "") ?? "";

  if (digits.length === 10 && digits.startsWith("3")) {
    return `57${digits}`;
  }

  return digits.length >= 8 ? digits : null;
}

/**
 * A stored number written for people: "+57 300 111 2233" for Colombian
 * mobiles, "+" and the digits otherwise, and an empty string when missing.
 */
export function formatWhatsAppNumber(value: string | null | undefined) {
  const digits = normalizeWhatsAppNumber(value);

  if (!digits) {
    return "";
  }

  const colombian = /^57(3\d{2})(\d{3})(\d{4})$/.exec(digits);

  return colombian
    ? `+57 ${colombian[1]} ${colombian[2]} ${colombian[3]}`
    : `+${digits}`;
}

/** A `wa.me` link with a prefilled message, or null without a number. */
export function getWhatsAppHref(
  number: string | null | undefined,
  message: string,
) {
  const normalized = normalizeWhatsAppNumber(number);

  return normalized
    ? `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
    : null;
}

/**
 * First message to an association about a product. It asks about the offer
 * and never implies that an order was placed: buying happens in the chat.
 */
export function getProductInquiryMessage({
  productName,
  associationName,
  productUrl,
}: {
  productName: string;
  associationName: string;
  productUrl?: string | null;
}) {
  return [
    `Hola, vi «${productName}» de ${associationName} en la vitrina de AROMA y me gustaría saber más: presentaciones, disponibilidad y cómo podría adquirirlo.`,
    productUrl,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** First message to an association about what it offers. */
export function getAssociationInquiryMessage({
  associationName,
  associationUrl,
}: {
  associationName: string;
  associationUrl?: string | null;
}) {
  return [
    `Hola, conocí a ${associationName} en la vitrina de AROMA y me gustaría saber más sobre sus productos.`,
    associationUrl,
  ]
    .filter(Boolean)
    .join("\n\n");
}
