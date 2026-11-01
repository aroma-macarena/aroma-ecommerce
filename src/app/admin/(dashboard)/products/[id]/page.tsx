import {
  ArrowDown,
  ArrowUp,
  Check,
  PackagePlus,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { StatusBadge } from "@/components/admin/status-badge";
import { SubmitButton } from "@/components/admin/submit-button";
import { buttonVariants } from "@/components/ui/button";
import {
  getProductPresentations,
  lastAvailableMessage,
  type ProductPresentation,
} from "@/lib/admin/presentation-mutations";
import {
  getEditableProduct,
  getProductFormOptions,
} from "@/lib/admin/product-mutations";
import {
  getProductPublication,
  type ProductPublication,
} from "@/lib/admin/product-publication";
import getCurrentProfile from "@/lib/auth/get-current-profile";
import { formatPresentationDetails } from "@/lib/presentation-format";
import { cn } from "@/lib/utils";

import { changeProductStatusAction, movePresentationAction } from "./actions";

export const metadata: Metadata = {
  title: "Producto",
};

const confirmations: Record<string, string> = {
  creado: "Producto creado como borrador.",
  actualizado: "Cambios guardados.",
  "presentacion-creada": "Presentación agregada.",
  "presentacion-actualizada": "Presentación actualizada.",
  "presentacion-eliminada": "Presentación eliminada.",
  publicado: "Producto publicado.",
  pausado: "Producto pausado: ya no aparece en la vitrina.",
};

const warnings: Record<string, string> = {
  "ultima-presentacion": lastAvailableMessage,
  requisitos:
    "No se pudo publicar: el producto no cumple todos los requisitos.",
  "estado-cambiado":
    "El estado del producto cambió mientras tanto. Revisa la información actual.",
};

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Bogota",
});

function PublicationPanel({
  productId,
  publication,
}: {
  productId: string;
  publication: ProductPublication;
}) {
  const { status, publishedAt, requirements, meetsRequirements } = publication;
  const isPublished = status === "PUBLISHED";
  const hiddenReason = !publication.associationIsActive
    ? "su asociación está inactiva"
    : !publication.categoryIsActive
      ? "su categoría está inactiva"
      : null;

  const summary = {
    DRAFT:
      "Solo lo ve la administración. Al publicarlo aparecerá en la vitrina.",
    PUBLISHED: [
      hiddenReason ? null : "Visible en la vitrina.",
      publishedAt
        ? `Publicado por primera vez el ${dateFormatter.format(publishedAt)}.`
        : null,
    ]
      .filter(Boolean)
      .join(" "),
    PAUSED:
      "No aparece en la vitrina y conserva toda su información. Puedes volver a publicarlo.",
  }[status];

  return (
    <>
      <div className="space-y-2">
        <StatusBadge status={status} />
        <p className="leading-7">{summary}</p>
      </div>

      {isPublished && hiddenReason ? (
        <AdminNotice tone="warning">
          Está publicado, pero no aparece en la vitrina porque {hiddenReason}.
        </AdminNotice>
      ) : null}

      {isPublished ? null : (
        <div className="space-y-2">
          <h3 className="text-muted-foreground font-mono text-xs font-medium tracking-[0.06em] uppercase">
            Requisitos para publicar
          </h3>
          <ul className="border-t">
            {requirements.map(({ id, label, met }) => (
              <li
                key={id}
                className={cn(
                  "flex items-start gap-2.5 border-b py-2.5 text-sm",
                  met ? "text-muted-foreground" : "font-medium",
                )}
              >
                {met ? (
                  <Check
                    aria-hidden
                    className="text-primary mt-0.5 size-4 shrink-0"
                  />
                ) : (
                  <X
                    aria-hidden
                    className="text-brand-orange mt-0.5 size-4 shrink-0"
                  />
                )}
                <span>
                  {label}
                  <span className="sr-only">
                    {met ? ": cumplido" : ": pendiente"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        action={changeProductStatusAction.bind(
          null,
          productId,
          isPublished ? "PAUSED" : "PUBLISHED",
        )}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
      >
        {isPublished ? (
          <SubmitButton variant="outline" pendingLabel="Pausando…">
            Pausar
          </SubmitButton>
        ) : (
          <SubmitButton
            disabled={!meetsRequirements}
            aria-describedby="publicacion-nota"
            pendingLabel="Publicando…"
          >
            {status === "DRAFT" ? "Publicar" : "Volver a publicar"}
          </SubmitButton>
        )}
        <p id="publicacion-nota" className="text-muted-foreground text-sm">
          {isPublished
            ? "Deja de aparecer en la vitrina sin borrar nada."
            : meetsRequirements
              ? status === "DRAFT"
                ? "Al publicarlo, su identificador web queda fijo."
                : "Volverá a aparecer en la vitrina."
              : "Completa los requisitos pendientes para publicarlo."}
        </p>
      </form>
    </>
  );
}

function PresentationRow({
  productId,
  presentation,
  isFirst,
  isLast,
}: {
  productId: string;
  presentation: ProductPresentation;
  isFirst: boolean;
  isLast: boolean;
}) {
  const details = formatPresentationDetails(presentation);
  const move = (direction: "up" | "down") =>
    movePresentationAction.bind(null, productId, presentation.id, direction);

  return (
    <li className="flex flex-col gap-3 border-b py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-0.5 wrap-anywhere">
        <p className="font-semibold">{presentation.name}</p>
        <p className="text-muted-foreground text-sm">
          {details || "Sin cantidad ni precio"}
          {" · "}
          <span
            className={cn(
              "font-mono text-xs tracking-[0.04em] uppercase",
              presentation.isAvailable && "text-primary",
            )}
          >
            {presentation.isAvailable ? "Disponible" : "No disponible"}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <form action={move("up")}>
          <SubmitButton
            variant="ghost"
            size="icon"
            disabled={isFirst}
            aria-label={`Subir ${presentation.name}`}
          >
            <ArrowUp aria-hidden />
          </SubmitButton>
        </form>
        <form action={move("down")}>
          <SubmitButton
            variant="ghost"
            size="icon"
            disabled={isLast}
            aria-label={`Bajar ${presentation.name}`}
          >
            <ArrowDown aria-hidden />
          </SubmitButton>
        </form>
        <Link
          href={`/admin/products/${productId}/presentations/${presentation.id}/edit`}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "ml-auto sm:ml-0",
          })}
        >
          <Pencil aria-hidden />
          Editar
          <span className="sr-only">{presentation.name}</span>
        </Link>
      </div>
    </li>
  );
}

function InfoItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid gap-1 border-b py-2.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-muted-foreground font-mono text-xs tracking-[0.06em] uppercase sm:pt-0.5">
        {label}
      </dt>
      <dd className={cn("wrap-anywhere", !value && "text-muted-foreground")}>
        {value || "Sin completar"}
      </dd>
    </div>
  );
}

export default async function ProductPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[id]">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const [{ id }, { estado, aviso }] = await Promise.all([params, searchParams]);
  const profile = result.currentProfile;
  const product = await getEditableProduct(profile, id);

  if (!product) {
    notFound();
  }

  const [publication, presentations, { categoryOptions }] = await Promise.all([
    getProductPublication(profile, product.id),
    getProductPresentations(product.id),
    getProductFormOptions(profile, product.categoryId),
  ]);

  if (!publication) {
    notFound();
  }

  const category = categoryOptions.find(
    ({ id: categoryId }) => categoryId === product.categoryId,
  );
  const confirmation =
    typeof estado === "string" ? confirmations[estado] : undefined;
  const warning = typeof aviso === "string" ? warnings[aviso] : undefined;
  const newPresentationHref = `/admin/products/${product.id}/presentations/new`;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href="/admin/products">Productos</AdminBackLink>
        <AdminPageHeader
          eyebrow={product.associationName}
          title={product.name}
          description="Gestiona su publicación, su información y sus presentaciones."
        />
      </div>

      {confirmation ? (
        <AdminNotice tone="success">{confirmation}</AdminNotice>
      ) : null}
      {warning ? <AdminNotice tone="error">{warning}</AdminNotice> : null}

      <AdminSection
        id="publicacion"
        title="Publicación"
        description="Qué ve el público y qué falta para publicar."
      >
        <PublicationPanel productId={product.id} publication={publication} />
      </AdminSection>

      <AdminSection
        id="presentaciones"
        title="Presentaciones"
        description="Las formas en que se ofrece el producto, en el orden en que se muestran."
      >
        {presentations.length > 0 ? (
          <>
            <ol aria-label="Presentaciones del producto" className="border-t">
              {presentations.map((presentation, index) => (
                <PresentationRow
                  key={presentation.id}
                  productId={product.id}
                  presentation={presentation}
                  isFirst={index === 0}
                  isLast={index === presentations.length - 1}
                />
              ))}
            </ol>
            <Link
              href={newPresentationHref}
              className={buttonVariants({
                variant: "outline",
                className: "w-full sm:w-auto",
              })}
            >
              <Plus aria-hidden />
              Agregar presentación
            </Link>
          </>
        ) : (
          <AdminEmptyState
            icon={PackagePlus}
            title="Sin presentaciones"
            description="Agrega al menos una disponible para poder publicar el producto, por ejemplo «Bolsa 250 g»."
            action={
              <Link
                href={newPresentationHref}
                className={buttonVariants({ variant: "outline" })}
              >
                <Plus aria-hidden />
                Agregar presentación
              </Link>
            }
          />
        )}
      </AdminSection>

      <AdminSection
        id="informacion"
        title="Información"
        description="Lo que el comprador lee en la ficha."
      >
        <dl className="border-t">
          <InfoItem
            label="Categoría"
            value={
              category
                ? `${category.name}${category.isActive ? "" : " (inactiva)"}`
                : null
            }
          />
          <InfoItem
            label="Descripción corta"
            value={product.shortDescription}
          />
          <InfoItem label="Origen" value={product.origin} />
          <InfoItem label="Disponibilidad" value={product.availabilityNote} />
          <InfoItem label="Identificador web" value={product.slug} />
        </dl>
        <Link
          href={`/admin/products/${product.id}/edit`}
          className={buttonVariants({
            variant: "outline",
            className: "w-full sm:w-auto",
          })}
        >
          <Pencil aria-hidden />
          Editar información
        </Link>
      </AdminSection>
    </div>
  );
}
