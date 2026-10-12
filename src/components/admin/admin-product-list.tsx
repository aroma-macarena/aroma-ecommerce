import { StatusBadge } from "@/components/admin/status-badge";
import type { AdminProduct } from "@/lib/admin/products";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Bogota",
});

type AdminProductListProps = {
  products: AdminProduct[];
  label: string;
  showAssociation?: boolean;
};

function ProductAction({ canManage }: { canManage: boolean }) {
  if (!canManage) {
    return (
      <span className="text-muted-foreground font-mono text-xs">
        Solo lectura
      </span>
    );
  }

  return (
    <span
      aria-disabled="true"
      className="text-muted-foreground inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium"
    >
      Editar
      <span className="font-mono text-[0.6875rem] tracking-[0.06em] uppercase">
        Pronto
      </span>
    </span>
  );
}

function ContextNote({ children }: { children: string }) {
  return (
    <span className="text-muted-foreground block font-mono text-[0.6875rem] tracking-[0.04em] uppercase">
      {children}
    </span>
  );
}

function AdminProductList({
  products,
  label,
  showAssociation = false,
}: AdminProductListProps) {
  return (
    <>
      <table className="hidden w-full text-sm md:table">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr className="text-muted-foreground border-b text-left font-mono text-[0.6875rem] tracking-[0.06em] uppercase">
            <th scope="col" className="py-2 pr-4 font-medium">
              Producto
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Categoría
            </th>
            {showAssociation ? (
              <th scope="col" className="py-2 pr-4 font-medium">
                Asociación
              </th>
            ) : null}
            <th scope="col" className="py-2 pr-4 font-medium">
              Estado
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b align-top">
              <th scope="row" className="py-3 pr-4 text-left font-normal">
                <span className="block font-semibold">{product.name}</span>
                <span className="text-muted-foreground text-xs">
                  Actualizado el{" "}
                  {dateFormatter.format(new Date(product.updatedAt))}
                </span>
              </th>
              <td className="py-3 pr-4">
                {product.categoryName}
                {product.categoryIsActive ? null : (
                  <ContextNote>Categoría inactiva</ContextNote>
                )}
              </td>
              {showAssociation ? (
                <td className="py-3 pr-4">
                  {product.associationName}
                  {product.associationStatus === "ACTIVE" ? null : (
                    <ContextNote>Asociación inactiva</ContextNote>
                  )}
                </td>
              ) : null}
              <td className="py-3 pr-4">
                <StatusBadge status={product.status} />
              </td>
              <td className="py-3 text-right">
                <ProductAction canManage={product.canManage} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul aria-label={label} className="border-t md:hidden">
        {products.map((product) => (
          <li key={product.id} className="space-y-2 border-b py-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold">{product.name}</p>
              <StatusBadge status={product.status} className="pt-0.5" />
            </div>
            <p className="text-muted-foreground text-sm">
              {product.categoryName}
              {showAssociation ? ` · ${product.associationName}` : null}
            </p>
            {product.categoryIsActive ? null : (
              <ContextNote>Categoría inactiva</ContextNote>
            )}
            {showAssociation && product.associationStatus !== "ACTIVE" ? (
              <ContextNote>Asociación inactiva</ContextNote>
            ) : null}
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-muted-foreground text-xs">
                Actualizado el{" "}
                {dateFormatter.format(new Date(product.updatedAt))}
              </span>
              <ProductAction canManage={product.canManage} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export { AdminProductList };
