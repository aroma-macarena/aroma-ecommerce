import { ExternalLink, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { buttonVariants } from "@/components/ui/button";
import { getAdminSiteContent } from "@/lib/admin/site-content";
import getCurrentProfile from "@/lib/auth/get-current-profile";
import { toParagraphs } from "@/lib/site-content/blocks";
import { formatWhatsAppNumber } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contenido",
};

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Bogota",
});

const confirmations: Record<string, string> = {
  guardado: "Cambios guardados. Ya se ven en el sitio público.",
  restaurado: "Se restauró el texto original.",
};

export default async function AdminContentPage({
  searchParams,
}: PageProps<"/admin/content">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const blocks = await getAdminSiteContent(result.currentProfile);

  // Alliance-wide copy: association administrators do not see it.
  if (!blocks) {
    notFound();
  }

  const { estado } = await searchParams;
  const confirmation =
    typeof estado === "string" ? confirmations[estado] : undefined;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Alianza AROMA"
        title="Contenido"
        description="Los textos institucionales del sitio público y el contacto de la alianza. Cada uno tiene un lugar fijo; aquí cambias el contenido y el diseño se mantiene."
      />

      {confirmation ? (
        <AdminNotice tone="success">{confirmation}</AdminNotice>
      ) : null}

      <ul aria-label="Contenido institucional" className="border-t">
        {blocks.map((block) => (
          <li
            key={block.key}
            className="grid gap-4 border-b py-5 md:grid-cols-[minmax(0,1fr)_auto] md:gap-8"
          >
            <div className="min-w-0 space-y-2">
              <h2 className="font-heading text-xl font-semibold tracking-[-0.015em]">
                {block.label}
              </h2>
              <p className="text-muted-foreground max-w-prose text-sm leading-6">
                {block.location}
              </p>
              {block.kind === "whatsapp" ? (
                <p className="border-border max-w-prose border-l-2 pl-4 text-sm leading-6">
                  {block.text.content ? (
                    <span className="font-semibold">
                      {formatWhatsAppNumber(block.text.content)}
                    </span>
                  ) : (
                    "Sin número: los botones de contacto con la alianza no se muestran."
                  )}
                </p>
              ) : (
                <blockquote className="border-border max-w-prose space-y-1 border-l-2 pl-4">
                  {block.title ? (
                    <p className="font-semibold wrap-anywhere">
                      {block.text.title}
                    </p>
                  ) : null}
                  {toParagraphs(block.text.content).map((paragraph, index) => (
                    <p key={index} className="text-sm leading-6 wrap-anywhere">
                      {paragraph}
                    </p>
                  ))}
                </blockquote>
              )}
              <p className="text-muted-foreground font-mono text-xs">
                {block.updatedAt
                  ? `Editado el ${dateFormatter.format(block.updatedAt)}${
                      block.updatedByName ? ` por ${block.updatedByName}` : ""
                    }`
                  : block.kind === "whatsapp"
                    ? block.text.content
                      ? "Configurado en el servidor"
                      : "Sin configurar"
                    : "Texto original"}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:flex-col md:items-stretch">
              <Link
                href={`/admin/content/${block.key}/edit`}
                className={buttonVariants({ className: "w-full sm:w-auto" })}
              >
                <Pencil aria-hidden />
                Editar
                <span className="sr-only">{block.label}</span>
              </Link>
              {block.href ? (
                <Link
                  href={block.href}
                  target="_blank"
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full sm:w-auto",
                  })}
                >
                  <ExternalLink aria-hidden />
                  Ver en el sitio
                  <span className="sr-only">
                    (se abre en una nueva pestaña)
                  </span>
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
