const GENERIC_OPENING =
  /^(asociaci[oó]n|colectivo|fundaci[oó]n|alianza|corporaci[oó]n|cooperativa)\s+(de\s+(las\s+|los\s+|la\s+|el\s+)?)?/i;

/**
 * The part of an association's name that tells producers apart where space
 * is short: "Asociación de Mujeres de San Juan" becomes "Mujeres de San
 * Juan". The full name stays everywhere else, screen readers included.
 */
export function getProducerLabel(name: string) {
  const label = name.trim().replace(GENERIC_OPENING, "");
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : name;
}
