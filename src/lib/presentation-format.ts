const quantityFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 3,
});

const priceFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

type PresentationAmounts = {
  quantity: string | null;
  unit: string | null;
  referencePrice: string | null;
};

/** "250 g", "1,5 kg" or just the unit when there is no quantity. */
export function formatPresentationSize({
  quantity,
  unit,
}: Pick<PresentationAmounts, "quantity" | "unit">) {
  return [quantity && quantityFormatter.format(Number(quantity)), unit]
    .filter(Boolean)
    .join(" ");
}

/** Reference price in Colombian pesos, such as "$ 25.000". */
export function formatReferencePrice(referencePrice: string | null) {
  return referencePrice === null
    ? null
    : priceFormatter.format(Number(referencePrice));
}

/** Size and price joined for a compact line, such as "250 g · $ 25.000". */
export function formatPresentationDetails(presentation: PresentationAmounts) {
  return [
    formatPresentationSize(presentation),
    formatReferencePrice(presentation.referencePrice),
  ]
    .filter(Boolean)
    .join(" · ");
}
