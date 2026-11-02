import {
  Building2,
  CircleAlert,
  CircleCheck,
  ExternalLink,
  FileText,
  Package,
  Plus,
  UserPlus,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminDashboardStats } from "@/components/admin/admin-dashboard-stats";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { buttonVariants } from "@/components/ui/button";
import {
  type AllianceDashboard,
  type AssociationDashboard,
  getAllianceDashboard,
  getAssociationDashboard,
} from "@/lib/admin/dashboard";
import getCurrentProfile from "@/lib/auth/get-current-profile";
import { getAssociationHref, publicRoutes } from "@/lib/public-routes";

export const metadata: Metadata = {
  title: "Inicio",
};

function plural(count: number, singular: string, pluralForm: string) {
  return count === 1 ? singular : pluralForm;
}

const primaryAction = buttonVariants({ className: "w-full sm:w-auto" });
const secondaryAction = buttonVariants({
  variant: "outline",
  className: "w-full sm:w-auto",
});

function AssociationHome({ dashboard }: { dashboard: AssociationDashboard }) {
  const { counts, drafts, association } = dashboard;
  const total = counts.published + counts.drafts + counts.paused;
  const publicProfileHref =
    association?.status === "ACTIVE"
      ? getAssociationHref(association.slug)
      : null;

  return (
    <>
      <AdminSection
        id="productos"
        title="Tus productos"
        description="Cuántos hay en cada estado. Solo los publicados se ven en la vitrina."
      >
        {total > 0 ? (
          <AdminDashboardStats
            label="Productos por estado"
            stats={[
              {
                label: plural(counts.published, "publicado", "publicados"),
                value: counts.published,
                href: "/admin/products",
              },
              {
                label: plural(counts.drafts, "borrador", "borradores"),
                value: counts.drafts,
                href: "/admin/products",
              },
              {
                label: plural(counts.paused, "pausado", "pausados"),
                value: counts.paused,
                href: "/admin/products",
              },
            ]}
          />
        ) : (
          <AdminEmptyState
            icon={Package}
            title="Aún no tienes productos"
            description="Crea el primero: empieza como borrador y lo publicas cuando tenga al menos una presentación disponible."
            action={
              <Link href="/admin/products/new" className={primaryAction}>
                <Plus aria-hidden />
                Nuevo producto
              </Link>
            }
          />
        )}
      </AdminSection>

      {drafts.length > 0 ? (
        <AdminSection
          id="borradores"
          title="Borradores"
          description="Lo que falta para publicar cada uno."
        >
          <ul className="border-t">
            {drafts.map((draft) => (
              <li
                key={draft.id}
                className="flex flex-col gap-1 border-b py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
              >
                <Link
                  href={`/admin/products/${draft.id}`}
                  className="min-w-0 font-semibold wrap-anywhere underline-offset-4 hover:underline"
                >
                  {draft.name}
                </Link>
                {draft.missing.length > 0 ? (
                  <ul className="text-sm sm:text-right">
                    {draft.missing.map((missing) => (
                      <li
                        key={missing}
                        className="flex items-start gap-1.5 sm:justify-end"
                      >
                        <CircleAlert
                          aria-hidden
                          className="text-brand-orange mt-0.5 size-4 shrink-0"
                        />
                        {missing}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-primary flex items-start gap-1.5 text-sm font-medium">
                    <CircleCheck
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0"
                    />
                    Listo para publicar
                  </p>
                )}
              </li>
            ))}
          </ul>
        </AdminSection>
      ) : null}

      <AdminSection
        id="accesos"
        title="Accesos"
        description="Lo más frecuente."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {/* Without products, the empty state already offers it. */}
          {total > 0 ? (
            <Link href="/admin/products/new" className={primaryAction}>
              <Plus aria-hidden />
              Nuevo producto
            </Link>
          ) : null}
          <Link href="/admin/association" className={secondaryAction}>
            <Building2 aria-hidden />
            Mi asociación
          </Link>
          {publicProfileHref ? (
            <Link
              href={publicProfileHref}
              target="_blank"
              className={secondaryAction}
            >
              <ExternalLink aria-hidden />
              Ver perfil público
              <span className="sr-only">(se abre en una nueva pestaña)</span>
            </Link>
          ) : null}
        </div>
      </AdminSection>
    </>
  );
}

function AllianceHome({ dashboard }: { dashboard: AllianceDashboard }) {
  return (
    <>
      <AdminSection
        id="resumen"
        title="La alianza hoy"
        description="Cada cifra lleva a su sección."
      >
        <AdminDashboardStats
          label="Resumen de la alianza"
          stats={[
            {
              label: plural(
                dashboard.associations.active,
                "asociación activa",
                "asociaciones activas",
              ),
              value: dashboard.associations.active,
              note: `de ${dashboard.associations.total}`,
              href: "/admin/associations",
            },
            {
              label: plural(
                dashboard.publishedProducts,
                "producto publicado",
                "productos publicados",
              ),
              value: dashboard.publishedProducts,
              href: "/admin/products",
            },
            {
              label: plural(
                dashboard.pendingInvitations,
                "invitación pendiente",
                "invitaciones pendientes",
              ),
              value: dashboard.pendingInvitations,
              href: "/admin/users",
            },
          ]}
        />
      </AdminSection>

      <AdminSection
        id="accesos"
        title="Accesos"
        description="Lo más frecuente."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href="/admin/associations/new" className={primaryAction}>
            <Plus aria-hidden />
            Nueva asociación
          </Link>
          <Link href="/admin/users/new" className={secondaryAction}>
            <UserPlus aria-hidden />
            Nuevo usuario
          </Link>
          <Link href="/admin/content" className={secondaryAction}>
            <FileText aria-hidden />
            Contenido
          </Link>
          <Link
            href={publicRoutes.products}
            target="_blank"
            className={secondaryAction}
          >
            <ExternalLink aria-hidden />
            Ver vitrina
            <span className="sr-only">(se abre en una nueva pestaña)</span>
          </Link>
        </div>
      </AdminSection>
    </>
  );
}

export default async function AdminPage() {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const profile = result.currentProfile;
  const [associationDashboard, allianceDashboard] = await Promise.all([
    getAssociationDashboard(profile),
    getAllianceDashboard(profile),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow={profile.associationName ?? "Alianza AROMA"}
        title={`Hola, ${profile.name}`}
        description={
          profile.associationName
            ? `Gestiona los productos y el perfil público de ${profile.associationName}.`
            : "Gestiona las asociaciones, las categorías, los productos, los textos institucionales y los usuarios de AROMA."
        }
      />

      {associationDashboard ? (
        <AssociationHome dashboard={associationDashboard} />
      ) : null}
      {allianceDashboard ? (
        <AllianceHome dashboard={allianceDashboard} />
      ) : null}
    </div>
  );
}
