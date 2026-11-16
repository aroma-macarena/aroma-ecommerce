import Image from "next/image";
import Link from "next/link";

import { AromaLogo } from "@/components/brand/aroma-logo";
import { AssociationLogo } from "@/components/catalog/association-logo";
import { ProducerCarousel } from "@/components/plaza/producer-carousel";
import { getProducerLabel } from "@/lib/catalog/producers";
import { getMediaUrl } from "@/lib/media";

export type RailProducer = {
  slug: string;
  name: string;
  location: string | null;
  logoObjectKey: string | null;
  coverObjectKey: string | null;
  productCount: number;
  href: string;
};

type ProducerRailProps = {
  producers: RailProducer[];
};

const collator = new Intl.Collator("es", { sensitivity: "base" });

/**
 * Walking from one producer to the next, in alphabetical order: each
 * organization led by its photo (or the "Foto en camino" placeholder), with
 * its logo when it has one and its place. Each card opens that
 * organization's page.
 */
function ProducerRail({ producers }: ProducerRailProps) {
  const sorted = [...producers].sort((a, b) =>
    collator.compare(getProducerLabel(a.name), getProducerLabel(b.name)),
  );

  return (
    <nav
      aria-labelledby="productoras-titulo"
      className="pt-10 pb-4 md:pt-14 md:pb-6"
    >
      <ProducerCarousel
        header={
          <div className="flex min-w-0 flex-1 items-center justify-between gap-6">
            <h2
              id="productoras-titulo"
              className="font-sign text-[2rem] leading-none uppercase md:text-[2.5rem]"
            >
              Productoras
            </h2>
            <p className="text-muted-foreground hidden max-w-sm text-right text-sm sm:block">
              Conoce a cada organización y todo lo que produce.
            </p>
          </div>
        }
      >
        {sorted.map((producer) => {
          const photoUrl = getMediaUrl(producer.coverObjectKey);
          const logoUrl = getMediaUrl(producer.logoObjectKey);
          return (
            <li
              key={producer.slug}
              className="w-[18.5rem] shrink-0 snap-start md:w-[21rem] lg:w-[calc((100%-3.75rem)/3.5)]"
            >
              <Link
                href={producer.href}
                className="group focus-visible:outline-ring relative flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <div className="bg-muted relative aspect-4/3 overflow-hidden">
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 300px, (min-width: 768px) 336px, 296px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                      <AromaLogo variant="symbol" className="w-14" />
                      <span className="text-muted-foreground text-sm font-semibold">
                        Foto en camino
                      </span>
                    </div>
                  )}
                  {logoUrl ? (
                    <AssociationLogo
                      name={producer.name}
                      objectKey={producer.logoObjectKey}
                      sizes="64px"
                      className="absolute bottom-3 left-3 size-16 rounded-full shadow-[0_2px_10px_oklch(0_0_0/0.2)]"
                    />
                  ) : null}
                </div>
                <span
                  aria-hidden
                  className="group-hover:bg-border mt-3 block h-[3px] bg-transparent transition-colors"
                />
                <span
                  aria-hidden
                  className="font-editorial mt-2 line-clamp-2 text-xl leading-snug font-semibold"
                >
                  {getProducerLabel(producer.name)}
                </span>
                <span className="sr-only">{producer.name}</span>
                <span className="mt-1 flex flex-wrap items-baseline gap-x-2">
                  {producer.location ? (
                    <span className="font-editorial italic">
                      {producer.location}
                    </span>
                  ) : null}
                  <span className="text-muted-foreground text-sm">
                    {producer.productCount === 1
                      ? "1 producto"
                      : `${producer.productCount} productos`}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ProducerCarousel>
    </nav>
  );
}

export { ProducerRail };
