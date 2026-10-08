import Link from "next/link";

import { AromaLogo } from "@/components/brand/aroma-logo";
import { Container } from "@/components/public/container";
import { Section } from "@/components/public/section";
import { SectionHeading } from "@/components/public/section-heading";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { homeContent } from "@/content/home";
import { publicRoutes } from "@/lib/public-routes";

export default function Home() {
  const { hero, about, associations } = homeContent;

  return (
    <>
      <Section className="py-16 md:py-24">
        <Container className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
          <div className="max-w-2xl space-y-6">
            <p className="text-brand-orange text-sm font-semibold tracking-wide uppercase">
              {hero.eyebrow}
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              {hero.title}
            </h1>
            <p className="text-muted-foreground text-lg leading-8">
              {hero.description}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={publicRoutes.products}
                className={buttonVariants({ size: "lg" })}
              >
                {hero.primaryAction}
              </Link>
              <Link
                href={publicRoutes.associations}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                {hero.secondaryAction}
              </Link>
            </div>
          </div>

          <AromaLogo
            variant="symbol"
            className="hidden w-56 md:block lg:w-72"
            sizes="(min-width: 1024px) 288px, 224px"
          />
        </Container>
      </Section>

      <Section className="bg-muted/40">
        <Container className="space-y-8">
          <SectionHeading title={about.title} description={about.description} />
          <ul className="grid gap-4 md:grid-cols-3">
            {about.highlights.map(({ title, description }) => (
              <li key={title}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="leading-6">
                      {description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            title={associations.title}
            description={associations.description}
          />
          <Link
            href={publicRoutes.associations}
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            {associations.action}
          </Link>
        </Container>
      </Section>
    </>
  );
}
