import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { buttonVariants } from "@/components/ui/button";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#contenido"
        className={buttonVariants({
          className:
            "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:px-4 focus:py-2",
        })}
      >
        Saltar al contenido
      </a>
      <PublicHeader />
      <main id="contenido" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </>
  );
}
