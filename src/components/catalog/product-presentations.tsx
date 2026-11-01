import type { PublicProduct } from "@/lib/catalog/queries";
import {
  formatPresentationSize,
  formatReferencePrice,
} from "@/lib/presentation-format";

type ProductPresentationsProps = {
  presentations: PublicProduct["presentations"];
};

/** Available presentations as label rows: name, size and reference price. */
function ProductPresentations({ presentations }: ProductPresentationsProps) {
  const hasPrices = presentations.some(
    ({ referencePrice }) => referencePrice !== null,
  );

  return (
    <section aria-labelledby="presentaciones-titulo" className="space-y-3">
      <h2
        id="presentaciones-titulo"
        className="text-muted-foreground font-mono text-xs font-medium tracking-[0.08em] uppercase"
      >
        Presentaciones
      </h2>

      {presentations.length > 0 ? (
        <>
          <ul className="border-foreground border-t-[1.5px]">
            {presentations.map((presentation) => {
              const size = formatPresentationSize(presentation);
              const price = formatReferencePrice(presentation.referencePrice);

              return (
                <li
                  key={presentation.id}
                  className="flex items-baseline justify-between gap-4 border-b py-3"
                >
                  <div className="min-w-0 wrap-anywhere">
                    <p className="font-medium">{presentation.name}</p>
                    {size ? (
                      <p className="text-muted-foreground font-mono text-xs">
                        {size}
                      </p>
                    ) : null}
                  </div>
                  {price ? (
                    <p className="font-heading shrink-0 text-lg font-medium tabular-nums">
                      {price}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {hasPrices ? (
            <p className="text-muted-foreground text-sm">
              Precios de referencia en pesos colombianos. Confírmalos con la
              asociación.
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-muted-foreground border-foreground border-t-[1.5px] pt-3">
          Consulta con la asociación las presentaciones disponibles.
        </p>
      )}
    </section>
  );
}

export { ProductPresentations };
