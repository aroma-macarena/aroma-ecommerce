import { Building2, Plus, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminDashboardStats } from "@/components/admin/admin-dashboard-stats";
import { PendingTaskList } from "@/components/admin/pending-task-list";
import { buttonVariants } from "@/components/ui/button";
import {
  getAllianceDashboard,
  getAssociationDashboard,
  getPendingTasks,
} from "@/lib/admin/dashboard";
import getCurrentProfile from "@/lib/auth/get-current-profile";

export const metadata: Metadata = {
  title: "Inicio",
};

function plural(count: number, singular: string, pluralForm: string) {
  return count === 1 ? singular : pluralForm;
}

function productStats(counts: {
  published: number;
  drafts: number;
  paused: number;
}) {
  return [
    {
      label: plural(counts.published, "Publicado", "Publicados"),
      value: counts.published,
      href: "/admin/products?estado=publicado",
    },
    {
      label: plural(counts.drafts, "Borrador", "Borradores"),
      value: counts.drafts,
      href: "/admin/products?estado=borrador",
    },
    {
      label: plural(counts.paused, "Pausado", "Pausados"),
      value: counts.paused,
      href: "/admin/products?estado=pausado",
    },
  ];
}

const primaryAction = buttonVariants({
  size: "lg",
  className: "w-full",
});
const secondaryAction = buttonVariants({
  variant: "outline",
  size: "lg",
  className: "w-full",
});

export default async function AdminPage() {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const profile = result.currentProfile;
  const [associationDashboard, allianceDashboard, tasks] = await Promise.all([
    getAssociationDashboard(profile),
    getAllianceDashboard(profile),
    getPendingTasks(profile),
  ]);
  const counts = associationDashboard?.counts ?? allianceDashboard?.counts;
  const firstName = profile.name.trim().split(/\s+/)[0];

  const summary = associationDashboard
    ? `${counts?.published ?? 0} ${plural(counts?.published ?? 0, "producto", "productos")} en la vitrina.`
    : allianceDashboard
      ? `${allianceDashboard.associations.active} ${plural(allianceDashboard.associations.active, "asociación activa", "asociaciones activas")} y ${allianceDashboard.publishedProducts} ${plural(allianceDashboard.publishedProducts, "producto", "productos")} en la vitrina.`
      : null;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-1">
        <h1 className="text-[1.75rem] leading-tight font-bold tracking-[-0.015em] md:text-[2rem]">
          Hola, {firstName}
        </h1>
        {summary ? <p className="text-muted-foreground">{summary}</p> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start xl:gap-8">
        <PendingTaskList tasks={tasks} />

        <div className="space-y-4">
          {counts ? (
            <AdminDashboardStats
              label={
                associationDashboard
                  ? "Tus productos por estado"
                  : "Productos de la alianza por estado"
              }
              stats={productStats(counts)}
            />
          ) : null}
          {associationDashboard ? (
            <Link href="/admin/products/new" className={primaryAction}>
              <Plus aria-hidden />
              Nuevo producto
            </Link>
          ) : (
            // The figures above count products: creating one comes first.
            <div className="grid gap-2">
              <Link href="/admin/products/new" className={primaryAction}>
                <Plus aria-hidden />
                Nuevo producto
              </Link>
              <Link href="/admin/associations/new" className={secondaryAction}>
                <Building2 aria-hidden />
                Nueva asociación
              </Link>
              <Link href="/admin/users/new" className={secondaryAction}>
                <UserPlus aria-hidden />
                Invitar a una persona
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
