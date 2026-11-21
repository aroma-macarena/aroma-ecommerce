import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import territoryImage from "@/assets/territorio-rio-guayabero.jpg";
import { Container } from "@/components/public/container";
import { homeContent } from "@/content/home";
import { publicRoutes } from "@/lib/public-routes";

type AllianceBoardProps = {
  title: string;
  description: string;
};

const { organizations } = homeContent.alliance;
const women = organizations.reduce((total, { women }) => total + women, 0);
const men = organizations.reduce(
  (total, organization) =>
    total + ("men" in organization ? organization.men : 0),
  0,
);

/**
 * The market's directory board: the alliance and every organization in it,
 * with how many people each brings. The total sits beside the list it adds
 * up, never on its own.
 */
function AllianceBoard({ title, description }: AllianceBoardProps) {
  return (
    <section
      id="alianza"
      aria-labelledby="alianza-titulo"
      className="bg-board text-board-foreground [--ring:var(--board-foreground)]"
    >
      <Container className="grid gap-10 py-14 md:py-20 lg:grid-cols-12 lg:gap-14">
        <figure className="space-y-2 lg:col-span-5">
          <div className="relative">
            <Image
              src={territoryImage}
              alt={homeContent.hero.image.alt}
              placeholder="blur"
              sizes="(min-width: 1024px) 36vw, 100vw"
              className="aspect-4/5 w-full object-cover"
            />
            <Image
              src="/brand/aroma-sello.svg"
              alt="Sello: Producto de la Alianza AROMA, hecho por mujeres campesinas"
              width={1525}
              height={1525}
              unoptimized
              className="absolute -right-2 -bottom-6 w-28 sm:w-32 lg:-right-8 lg:w-36"
            />
          </div>
          <figcaption className="font-editorial text-board-foreground/80 italic">
            {homeContent.hero.image.caption}
          </figcaption>
        </figure>

        <div className="flex flex-col gap-6 lg:col-span-7 lg:pt-4 lg:pb-9">
          <h2
            id="alianza-titulo"
            className="font-editorial text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.02em] text-balance md:text-[3.5rem]"
          >
            {title}
          </h2>
          <p className="font-editorial text-board-foreground/90 max-w-[60ch] text-xl leading-relaxed">
            {description}
          </p>

          <p className="font-sign border-board-foreground/60 mt-2 border-b pb-4 lg:mt-auto text-[1.75rem] leading-[0.95] uppercase md:text-[2.25rem]">
            {women} mujeres
            {men > 0 ? ` y ${men} hombres` : ""} en {organizations.length}{" "}
            organizaciones
          </p>
        </div>

        <div className="lg:col-span-12">
          <ul className="grid sm:grid-cols-2 sm:gap-x-8">
            {organizations.map((organization) => (
              <li
                key={organization.acronym}
                className="border-board-foreground/20 flex flex-col gap-1 border-b py-2.5 sm:py-3.5"
              >
                <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="text-[0.9375rem] font-bold tracking-[0.04em]">
                    {organization.acronym}
                  </span>
                  <span className="shrink-0 text-sm font-semibold">
                    {organization.women} mujeres
                    {"men" in organization
                      ? ` y ${organization.men} hombres`
                      : ""}
                  </span>
                </p>
                {/* Full names are kept for screen readers on phones, where
                      the list stays compact. */}
                <p className="font-editorial text-board-foreground/80 sr-only text-[0.9375rem] leading-snug sm:not-sr-only">
                  {organization.name}
                </p>
              </li>
            ))}
          </ul>
          <Link
            href={publicRoutes.associations}
            className="decoration-board-foreground/50 hover:decoration-board-foreground mt-6 inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-2 underline-offset-[5px] transition-colors"
          >
            Conoce las asociaciones
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}

export { AllianceBoard };
