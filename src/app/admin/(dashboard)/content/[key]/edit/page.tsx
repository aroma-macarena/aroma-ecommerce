import { ExternalLink, RotateCcw } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { SiteContentForm } from "@/components/admin/site-content-form";
import { getEditableSiteContent } from "@/lib/admin/site-content";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import {
  restoreOriginalSiteContentAction,
  updateSiteContentAction,
} from "../../actions";

export const metadata: Metadata = {
  title: "Editar contenido",
};

export default async function EditSiteContentPage({
  params,
}: PageProps<"/admin/content/[key]/edit">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const block = await getEditableSiteContent(
    result.currentProfile,
    (await params).key,
  );

  // Unknown block, or not a super administrator.
  if (!block) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminBackLink href="/admin/content">Contenido</AdminBackLink>
        <AdminPageHeader
          eyebrow="Alianza AROMA"
          title={block.label}
          description={block.location}
          actions={
            <Link
              href={block.href}
              target="_blank"
              className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              Ver en el sitio
              <ExternalLink aria-hidden className="size-3.5" />
              <span className="sr-only">(se abre en una nueva pestaña)</span>
            </Link>
          }
        />
      </div>

      <SiteContentForm
        block={block}
        initialValues={{ title: block.text.title, content: block.text.content }}
        action={updateSiteContentAction.bind(null, block.key)}
      />

      {block.isOriginal ? null : (
        <AdminSection
          id="original"
          title="Texto original"
          description="El que trae el sitio, por si quieres volver a él."
          ruled
        >
          <blockquote className="border-border max-w-prose space-y-1 border-l-2 pl-4">
            {block.fallback.title ? (
              <p className="font-semibold">{block.fallback.title}</p>
            ) : null}
            <p className="text-sm leading-6 whitespace-pre-line">
              {block.fallback.content}
            </p>
          </blockquote>
          <ConfirmActionButton
            trigger={
              <>
                <RotateCcw aria-hidden />
                Restaurar texto original
              </>
            }
            triggerClassName="w-full sm:w-auto"
            title="¿Restaurar el texto original?"
            description="El sitio público volverá a mostrar el texto original de este bloque. El texto actual se reemplaza."
            confirmLabel="Restaurar"
            pendingLabel="Restaurando…"
            action={restoreOriginalSiteContentAction.bind(null, block.key)}
          />
        </AdminSection>
      )}
    </div>
  );
}
