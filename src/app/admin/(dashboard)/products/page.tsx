import { CircleCheck, PackageOpen, Plus, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminProductList } from "@/components/admin/admin-product-list";
import { buttonVariants } from "@/components/ui/button";
import { getAdminProducts } from "@/lib/admin/products";
import getCurrentProfile from "@/lib/auth/get-current-profile";

export const metadata: Metadata = {
  title: "Productos",
};

const savedMessages = {
  creado: "Producto creado como borrador.",
  actualizado: "Cambios guardados.",
} as const;

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const { estado } = await searchParams;
  const savedMessage =
    estado === "creado" || estado === "actualizado"
      ? savedMessages[estado]
      : null;
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
            ? "Consulta los productos de tu asociación y los publicados por otras asociaciones de la alianza."
            : "Consulta los productos de todas las asociaciones de la alianza, en cualquier estado."
        }
        actions={
          <Link
            href="/admin/products/new"
            className={buttonVariants({ className: "w-full md:w-auto" })}
          >
            <Plus aria-hidden />
            Nuevo producto
          </Link>
        }
      />

      {savedMessage ? (
        <p
          role="status"
          className="border-primary bg-accent flex items-center gap-2 border-l-[3px] px-4 py-3 text-sm font-medium"
        >
          <CircleCheck aria-hidden className="text-primary size-4 shrink-0" />
          {savedMessage}
        </p>
      ) : null}

      <section aria-labelledby="productos-gestionables" className="space-y-4">
        <h2
          id="productos-gestionables"
          className="font-heading text-xl font-semibold tracking-[-0.015em]"
        >
          {isAssociationAdmin ? "Tus productos" : "Todos los productos"}
        </h2>
        {manageableProducts.length > 0 ? (
          <AdminProductList
            products={manageableProducts}
            label={
              isAssociationAdmin
                ? "Productos de tu asociación"
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
            description="Crea el primero: se guardará como borrador hasta que lo publiques."
            action={
              <Link
                href="/admin/products/new"
                className={buttonVariants({ variant: "outline" })}
              >
                Nuevo producto
              </Link>
            }
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
