import type { Metadata } from "next";
import Link from "next/link";

import { AssociationLogo } from "@/components/catalog/association-logo";
import { Container } from "@/components/public/container";
import { SectionHeading } from "@/components/public/section-heading";
import { getPublicAssociations } from "@/lib/catalog/queries";
import { getAssociationHref } from "@/lib/public-routes";

// Read on every request: associations and their product counts change from
// the admin, and the build has no database to prerender from.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Asociaciones",
  description:
    "Las organizaciones de mujeres productoras que forman la Alianza AROMA, en La Macarena, Meta, y lo que ofrece cada una.",
};

function formatProductCount(count: number) {
  if (count === 0) {
    return "Sin productos publicados";
  }

  return count === 1 ? "1 producto" : `${count} productos`;
}

export default async function AssociationsPage() {
  const associations = await getPublicAssociations();

  return (
    <Container className="space-y-10 pt-8 pb-16 md:space-y-14 md:pt-14 md:pb-24">
      <SectionHeading
        as="h1"
        eyebrow="La alianza"
        title="Asociaciones"
        description="Las organizaciones de mujeres productoras de La Macarena que forman la Alianza AROMA. Conoce quiénes son y qué ofrece cada una."
      />

      {associations.length > 0 ? (
        <ul className="border-foreground border-t-[1.5px]">
          {associations.map((association) => (
            <li
              key={association.slug}
              className="group has-[a:focus-visible]:outline-ring relative grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 border-b py-5 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-6"
            >
              <AssociationLogo
                name={association.name}
                objectKey={association.logoObjectKey}
                sizes="4.5rem"
                className="row-span-2 sm:row-span-1"
              />
              <div className="min-w-0 space-y-1 wrap-anywhere">
                <h2 className="font-heading text-xl leading-tight font-semibold tracking-[-0.015em] md:text-2xl">
                  <Link
                    href={getAssociationHref(association.slug)}
                    className="decoration-1 underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0"
                  >
                    {association.name}
                  </Link>
                </h2>
                {association.location ? (
                  <p className="font-mono text-xs">{association.location}</p>
                ) : null}
                {association.description ? (
                  <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                    {association.description}
                  </p>
                ) : null}
              </div>
              <p className="text-muted-foreground col-start-2 font-mono text-xs tracking-[0.04em] uppercase sm:col-start-auto sm:text-right">
                {formatProductCount(association.productCount)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground max-w-xl leading-relaxed">
          Pronto encontrarás aquí las asociaciones de la Alianza AROMA.
        </p>
      )}
    </Container>
  );
}
