import { PackageOpen, Plus, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminProductList } from "@/components/admin/admin-product-list";
import { ProductSearch } from "@/components/admin/product-search";
import { buttonVariants } from "@/components/ui/button";
import { type AdminProduct, getAdminProducts } from "@/lib/admin/products";
import getCurrentProfile from "@/lib/auth/get-current-profile";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Productos",
};

const statusFilters = [
  { value: undefined, label: "Todos" },
  { value: "publicado", label: "Publicados", status: "PUBLISHED" },
  { value: "borrador", label: "Borradores", status: "DRAFT" },
  { value: "pausado", label: "Pausados", status: "PAUSED" },
] as const;

type StatusFilter = (typeof statusFilters)[number];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function filterHref(estado: string | undefined, q: string | undefined) {
  const params = new URLSearchParams();
  if (estado) params.set("estado", estado);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}

function countFor(products: AdminProduct[], filter: StatusFilter) {
  return "status" in filter
    ? products.filter(({ status }) => status === filter.status).length
    : products.length;
}

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const params = await searchParams;
  const estado = first(params.estado);
  const q = first(params.q)?.trim() || undefined;
  const activeFilter =
    statusFilters.find(({ value }) => value === estado) ?? statusFilters[0];

  const profile = result.currentProfile;
  const products = await getAdminProducts(profile);
  const isAssociationAdmin = profile.role === "ASSOCIATION_ADMIN";
  const manageable = products.filter(({ canManage }) => canManage);
  const references = products.filter(({ canManage }) => !canManage);

  const matchesQuery = (product: AdminProduct) =>
    !q ||
    normalize(
      `${product.name} ${product.associationName} ${product.categoryName}`,
    ).includes(normalize(q));
  const searched = manageable.filter(matchesQuery);
  const showFilters = !isAssociationAdmin || estado !== undefined;
  const shown =
    "status" in activeFilter
      ? searched.filter(({ status }) => status === activeFilter.status)
      : searched;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Productos"
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

      <section aria-labelledby="productos-gestionables" className="space-y-4">
        <h2 id="productos-gestionables" className="sr-only">
          {isAssociationAdmin ? "Tus productos" : "Todos los productos"}
        </h2>

        {/* An association has a handful of products: the filters show only
            when it arrives from a count on the home page. */}
        {showFilters ? (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <nav
              aria-label="Filtrar por estado"
              className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
            >
              <ul className="flex gap-2">
                {statusFilters.map((filter) => {
                  const isActive = filter.value === activeFilter.value;
                  return (
                    <li key={filter.label}>
                      <Link
                        href={filterHref(filter.value, q)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-[0.9375rem] whitespace-nowrap transition-colors duration-150",
                          isActive
                            ? "border-primary bg-primary text-primary-foreground font-bold"
                            : "bg-card hover:border-primary hover:text-primary",
                        )}
                      >
                        {filter.label}
                        <span
                          className={
                            isActive
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          }
                        >
                          {countFor(searched, filter)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Few products per association: the search is the alliance's. */}
            {isAssociationAdmin ? null : (
              <Suspense>
                <ProductSearch />
              </Suspense>
            )}
          </div>
        ) : null}

        {shown.length > 0 ? (
          <AdminProductList
            products={shown}
            label={
              isAssociationAdmin
                ? "Productos de tu asociación"
                : "Todos los productos"
            }
            showAssociation={!isAssociationAdmin}
          />
        ) : manageable.length > 0 ? (
          <div className="bg-card rounded-md border px-4 py-8 text-center">
            <p className="font-bold">
              {q
                ? `Nada coincide con «${q}».`
                : "No hay productos en este estado."}
            </p>
            <Link
              href="/admin/products"
              className="text-primary mt-2 inline-flex min-h-11 items-center font-bold underline-offset-4 hover:underline"
            >
              Ver todos los productos
            </Link>
          </div>
        ) : (
          <AdminEmptyState
            icon={PackageOpen}
            title={
              isAssociationAdmin
                ? "Tu asociación aún no tiene productos"
                : "Aún no hay productos"
            }
            description="Se guarda como borrador hasta que lo publiques."
            action={
              <Link href="/admin/products/new" className={buttonVariants()}>
                <Plus aria-hidden />
                Nuevo producto
              </Link>
            }
          />
        )}
      </section>

      {isAssociationAdmin ? (
        <section aria-labelledby="productos-referencia" className="space-y-3">
          <div>
            <h2 id="productos-referencia" className="text-lg font-bold">
              De otras asociaciones
            </h2>
            <p className="text-muted-foreground text-sm">
              Publicados en la vitrina. Solo para consultar.
            </p>
          </div>
          {references.length > 0 ? (
            <AdminProductList
              products={references}
              label="Productos publicados por otras asociaciones"
              showAssociation
            />
          ) : (
            <AdminEmptyState
              icon={Store}
              title="Aún no hay publicaciones de otras asociaciones"
            />
          )}
        </section>
      ) : null}
    </div>
  );
}
