import { PackageOpen, Store } from "lucide-react";
import type { Metadata } from "next";

import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminProductList } from "@/components/admin/admin-product-list";
import { Button } from "@/components/ui/button";
import { getAdminProducts } from "@/lib/admin/products";
import getCurrentProfile from "@/lib/auth/get-current-profile";

export const metadata: Metadata = {
  title: "Productos",
};

export default async function AdminProductsPage() {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const profile = result.currentProfile;
  const products = await getAdminProducts(profile);
  const manageableProducts = products.filter(({ canManage }) => canManage);
  const referenceProducts = products.filter(({ canManage }) => !canManage);
  const isAssociationAdmin = profile.role === "ASSOCIATION_ADMIN";

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow={profile.associationName ?? "Alianza AROMA"}
        title="Productos"
        description={
          isAssociationAdmin
            ? `Consulta los productos de ${profile.associationName} y los publicados por otras asociaciones de la alianza.`
            : "Consulta los productos de todas las asociaciones de la alianza, en cualquier estado."
        }
        actions={
          <div className="flex flex-col gap-1 md:items-end">
            <Button disabled aria-describedby="nuevo-producto-estado">
              Nuevo producto
            </Button>
            <span
              id="nuevo-producto-estado"
              className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.06em] uppercase"
            >
              Disponible pronto
            </span>
          </div>
        }
      />

      <section aria-labelledby="productos-gestionables" className="space-y-4">
        <h2
          id="productos-gestionables"
          className="font-heading text-xl font-semibold tracking-[-0.015em]"
        >
          {isAssociationAdmin
            ? `Productos de ${profile.associationName}`
            : "Todos los productos"}
        </h2>
        {manageableProducts.length > 0 ? (
          <AdminProductList
            products={manageableProducts}
            label={
              isAssociationAdmin
                ? `Productos de ${profile.associationName}`
                : "Todos los productos"
            }
            showAssociation={!isAssociationAdmin}
          />
        ) : (
          <AdminEmptyState
            icon={PackageOpen}
            title={
              isAssociationAdmin
                ? "Tu asociación aún no tiene productos"
                : "Aún no hay productos registrados"
            }
            description="Cuando la creación de productos esté disponible, podrás agregarlos desde esta página."
          />
        )}
      </section>

      {isAssociationAdmin ? (
        <section aria-labelledby="productos-referencia" className="space-y-4">
          <div className="space-y-1">
            <h2
              id="productos-referencia"
              className="font-heading text-xl font-semibold tracking-[-0.015em]"
            >
              Publicados por otras asociaciones
            </h2>
            <p className="text-muted-foreground text-sm">
              Solo de consulta: no puedes modificar estos productos.
            </p>
          </div>
          {referenceProducts.length > 0 ? (
            <AdminProductList
              products={referenceProducts}
              label="Productos publicados por otras asociaciones"
              showAssociation
            />
          ) : (
            <AdminEmptyState
              icon={Store}
              title="Sin publicaciones todavía"
              description="Cuando otras asociaciones de la alianza publiquen productos, aparecerán aquí como referencia."
            />
          )}
        </section>
      ) : null}
    </div>
  );
}
