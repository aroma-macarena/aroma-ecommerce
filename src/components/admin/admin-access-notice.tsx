import { LockKeyhole, MessageCircle, Pause } from "lucide-react";
import Link from "next/link";

import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { AromaLogo } from "@/components/brand/aroma-logo";
import { buttonVariants } from "@/components/ui/button";
import { publicRoutes } from "@/lib/public-routes";
import { getSupportWhatsAppHref } from "@/lib/support";

type AccessNoticeReason =
  "PROFILE_NOT_FOUND" | "INACTIVE" | "ASSOCIATION_INACTIVE";

const notices = {
  PROFILE_NOT_FOUND: {
    icon: LockKeyhole,
    title: "Tu cuenta aún no tiene acceso",
    request: "Mi cuenta aún no tiene acceso al panel.",
    description:
      "Para entrar al panel, la administración de la Alianza debe habilitar tu cuenta. Escríbele para solicitarlo.",
  },
  INACTIVE: {
    icon: Pause,
    title: "Tu acceso está pausado",
    request: "Mi acceso al panel aparece pausado.",
    description:
      "Por ahora no puedes entrar al panel. Si necesitas reactivarlo o tienes dudas, la administración de la Alianza puede ayudarte.",
  },
  ASSOCIATION_INACTIVE: {
    icon: Pause,
    title: "El acceso de tu asociación está pausado",
    request: "El acceso de mi asociación al panel aparece pausado.",
    description:
      "Por ahora no puedes entrar al panel. Si necesitas reactivarlo o tienes dudas, la administración de la Alianza puede ayudarte.",
  },
} satisfies Record<
  AccessNoticeReason,
  { icon: typeof Pause; title: string; request: string; description: string }
>;

type AdminAccessNoticeProps = {
  reason: AccessNoticeReason;
  email?: string | null;
  associationName?: string | null;
};

function AdminAccessNotice({
  reason,
  email,
  associationName,
}: AdminAccessNoticeProps) {
  const { icon: Icon, title, request, description } = notices[reason];
  const details = [
    { label: "Asociación", value: associationName },
    { label: "Cuenta", value: email },
  ].filter((detail): detail is { label: string; value: string } =>
    Boolean(detail.value),
  );
  const whatsAppHref = getSupportWhatsAppHref(
    [
      `Hola, necesito ayuda con el panel de AROMA. ${request}`,
      ...details.map(({ label, value }) => `${label}: ${value}.`),
    ].join("\n"),
  );

  return (
    <main className="bg-background flex min-h-svh flex-1 items-center justify-center px-5 py-12">
      <div className="w-full max-w-md space-y-6">
        <AromaLogo className="mx-auto w-36" />

        <div className="bg-card space-y-6 rounded-lg border p-6 text-center sm:p-8">
          <span className="bg-brand-orange/12 text-brand-orange mx-auto flex size-14 items-center justify-center rounded-full">
            <Icon className="size-6" aria-hidden="true" />
          </span>

          <div className="space-y-2">
            <h1 className="font-heading text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance sm:text-3xl">
              {title}
            </h1>
            <p className="text-muted-foreground leading-7 text-balance">
              {description}
            </p>
          </div>

          {details.length > 0 ? (
            <dl className="bg-muted/70 grid gap-y-3 rounded-md px-4 py-3 text-left text-sm sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-4 sm:gap-y-2">
              {details.map(({ label, value }) => (
                <div key={label} className="sm:contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium wrap-anywhere sm:text-right">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="space-y-3">
            {whatsAppHref ? (
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ className: "w-full" })}
              >
                <MessageCircle data-icon="inline-start" />
                Escribir a la administración
              </a>
            ) : null}
            <AdminSignOutButton label="Usar otra cuenta" />
            <Link
              href={publicRoutes.home}
              className="text-muted-foreground hover:text-primary flex min-h-11 items-center justify-center rounded-md text-sm underline underline-offset-4"
            >
              Volver al sitio público
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export { AdminAccessNotice };
