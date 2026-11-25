import type { PublicProduct } from "@/lib/catalog/queries";
import {
  formatPresentationSizeNote,
  formatReferencePrice,
} from "@/lib/presentation-format";

type ProductPresentationsProps = {
  presentations: PublicProduct["presentations"];
};

/**
 * Available presentations as label rows: name, size and reference price.
 * The page notes that prices are a reference, under its contact action.
 */
function ProductPresentations({ presentations }: ProductPresentationsProps) {
  return (
    <section aria-labelledby="presentaciones-titulo" className="space-y-3">
      <h2
        id="presentaciones-titulo"
        className="text-muted-foreground text-sm font-semibold"
      >
        Presentaciones
      </h2>

      {/* The featured card's price board: name left, figure right. */}
      {presentations.length > 0 ? (
        <ul className="border-foreground border-t">
          {presentations.map((presentation) => {
            const size = formatPresentationSizeNote(presentation);
            const price = formatReferencePrice(presentation.referencePrice);

            return (
              <li
                key={presentation.id}
                className="flex items-baseline justify-between gap-4 border-b py-2.5"
              >
                <p className="min-w-0 wrap-anywhere">
                  <span className="font-semibold">{presentation.name}</span>
                  {size ? (
                    <span className="text-muted-foreground"> · {size}</span>
                  ) : null}
                </p>
                <p className="font-sign shrink-0 text-[2rem] leading-none md:text-[2.25rem]">
                  {price ?? (
                    <span className="text-muted-foreground font-sans text-sm font-medium">
                      Consultar
                    </span>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="border-foreground border-y py-3 text-[0.9375rem] font-medium">
          Presentaciones y precios: pregunta por WhatsApp.
        </p>
      )}
    </section>
  );
}

export { ProductPresentations };
