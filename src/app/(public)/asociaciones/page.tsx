import type { Metadata } from "next";

import {
  AssociationDirectory,
  type DirectoryAssociation,
} from "@/components/plaza/association-directory";
import { TerritoryMap } from "@/components/plaza/territory-map";
import { Container } from "@/components/public/container";
import { getTerritoryZone } from "@/content/territory";
import { getPublicAssociations } from "@/lib/catalog/queries";
import { getMediaUrl } from "@/lib/media";
import { getAssociationHref } from "@/lib/public-routes";
import { getSiteContent } from "@/lib/site-content/queries";

// Read on every request: associations and their product counts change from
// the admin, and the build has no database to prerender from.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Asociaciones",
  description:
    "Las organizaciones de mujeres productoras que forman la Alianza AROMA, en La Macarena, Meta, y lo que ofrece cada una.",
};

export default async function AssociationsPage() {
  const [associations, content] = await Promise.all([
    getPublicAssociations(),
    getSiteContent(),
  ]);

  const directory: DirectoryAssociation[] = associations.map((association) => ({
    slug: association.slug,
    name: association.name,
    location: association.location,
    description: association.description,
    productCount: association.productCount,
    href: getAssociationHref(association.slug),
    logoUrl: getMediaUrl(association.logoObjectKey),
    coverUrl: getMediaUrl(association.coverObjectKey),
    // Only zones on the map count; anything else stays off it.
    zone: getTerritoryZone(association.zone)?.slug ?? null,
  }));
  const zoneCount = new Set(
    directory.flatMap(({ zone }) => (zone ? [zone] : [])),
  ).size;

  return (
    <Container className="space-y-10 pt-8 pb-16 md:space-y-12 md:pt-12 md:pb-24">
      <header className="space-y-4">
        <h1 className="font-sign text-[2.75rem] leading-[0.9] uppercase sm:text-[4rem] lg:text-[4.5rem]">
          Asociaciones
        </h1>
        <div className="space-y-2">
          <p className="font-editorial text-muted-foreground text-lg leading-relaxed md:text-xl">
            {content.associations_intro.content}
          </p>
          {directory.length > 0 ? (
            <p className="text-sm font-semibold">
              {directory.length === 1
                ? "1 asociación"
                : `${directory.length} asociaciones`}
              {zoneCount > 0
                ? ` en ${zoneCount === 1 ? "1 zona" : `${zoneCount} zonas`} de La Macarena`
                : ""}
            </p>
          ) : null}
        </div>
      </header>

      {directory.length > 0 ? (
        <AssociationDirectory associations={directory} map={<TerritoryMap />} />
      ) : (
        <p className="font-editorial text-muted-foreground max-w-xl text-lg leading-relaxed">
          Pronto encontrarás aquí las asociaciones de la Alianza AROMA.
        </p>
      )}
    </Container>
  );
}
