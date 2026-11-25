import { and, asc, count, eq, isNotNull, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { associationsTable as associations } from "@/db/schema/associations";
import { categoriesTable as categories } from "@/db/schema/categories";
import { productImagesTable as productImages } from "@/db/schema/productImages";
import { productPresentationsTable as productPresentations } from "@/db/schema/productPresentations";
import { productsTable as products } from "@/db/schema/products";
import { profilesTable as profiles } from "@/db/schema/profiles";
import {
  getPublicationRequirements,
  type PublicationRequirement,
} from "@/lib/admin/product-publication";
import { isAssociationAdmin, isSuperAdmin } from "@/lib/auth/authorization";
import type { AdminProfile } from "@/lib/auth/get-current-profile";
import { getAllianceWhatsAppNumber } from "@/lib/site-content/queries";

/** What blocks a draft, worded as what is missing. */
const missingLabels: Record<PublicationRequirement["id"], string> = {
  name: "Le falta el nombre",
  category: "Su categoría está inactiva",
  association: "La asociación está inactiva",
  presentation: "Le falta una presentación disponible",
};

const availablePresentations = sql<number>`(
  select count(*)::int from ${productPresentations}
  where ${productPresentations.productId} = ${products.id}
    and ${productPresentations.isAvailable}
)`;

/**
 * The association administrator's summary: their products by status, the
 * drafts with what each one still needs to be published, and the
 * association's public state. Null for anyone else.
 */
export async function getAssociationDashboard(profile: AdminProfile) {
  if (!isAssociationAdmin(profile)) {
    return null;
  }

  const ownProducts = eq(products.associationId, profile.associationId);

  const [statusCounts, drafts, [association]] = await Promise.all([
    db
      .select({ status: products.status, total: count() })
      .from(products)
      .where(ownProducts)
      .groupBy(products.status),
    db
      .select({
        id: products.id,
        name: products.name,
        categoryIsActive: categories.isActive,
        associationStatus: associations.status,
        availablePresentations,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(associations, eq(products.associationId, associations.id))
      .where(and(ownProducts, eq(products.status, "DRAFT")))
      .orderBy(
        sql`coalesce(${products.updatedAt}, ${products.createdAt}) desc`,
        asc(products.id),
      ),
    db
      .select({ slug: associations.slug, status: associations.status })
      .from(associations)
      .where(eq(associations.id, profile.associationId))
      .limit(1),
  ]);

  const byStatus = Object.fromEntries(
    statusCounts.map(({ status, total }) => [status, total]),
  );

  return {
    counts: {
      published: byStatus.PUBLISHED ?? 0,
      drafts: byStatus.DRAFT ?? 0,
      paused: byStatus.PAUSED ?? 0,
    },
    drafts: drafts.map((draft) => {
      const missing = getPublicationRequirements({
        name: draft.name,
        categoryIsActive: draft.categoryIsActive,
        associationIsActive: draft.associationStatus === "ACTIVE",
        availablePresentations: draft.availablePresentations,
      })
        .filter(({ met }) => !met)
        .map(({ id }) => missingLabels[id]);

      return { id: draft.id, name: draft.name, missing };
    }),
    association: association ?? null,
  };
}

export type AssociationDashboard = NonNullable<
  Awaited<ReturnType<typeof getAssociationDashboard>>
>;

/**
 * The super administrator's summary of the alliance: associations, what the
 * storefront shows and invitations waiting to be accepted. Null for anyone
 * else.
 */
export async function getAllianceDashboard(profile: AdminProfile) {
  if (!isSuperAdmin(profile)) {
    return null;
  }

  const [[associationCounts], [productCounts], [invitationCounts]] =
    await Promise.all([
      db
        .select({
          total: count(),
          active: sql<number>`count(*) filter (where ${associations.status} = 'ACTIVE')::int`,
        })
        .from(associations),
      db
        .select({
          published: sql<number>`count(*) filter (where ${products.status} = 'PUBLISHED')::int`,
          drafts: sql<number>`count(*) filter (where ${products.status} = 'DRAFT')::int`,
          paused: sql<number>`count(*) filter (where ${products.status} = 'PAUSED')::int`,
        })
        .from(products),
      db
        .select({ pending: count() })
        .from(profiles)
        .where(isNotNull(profiles.invitationId)),
    ]);

  return {
    associations: {
      active: associationCounts.active,
      total: associationCounts.total,
    },
    publishedProducts: productCounts.published,
    counts: {
      published: productCounts.published,
      drafts: productCounts.drafts,
      paused: productCounts.paused,
    },
    pendingInvitations: invitationCounts.pending,
  };
}

export type AllianceDashboard = NonNullable<
  Awaited<ReturnType<typeof getAllianceDashboard>>
>;

/** One thing missing, worded so the row says what to do and where. */
export type PendingTask = {
  id: string;
  /** What it is about: a product, the association, a person. */
  subject: string;
  /** What is missing, in a few words. */
  missing: string;
  /** The verb on the row's link. */
  action: string;
  href: string;
};

const hasNoImages = sql<boolean>`not exists (
  select 1 from ${productImages}
  where ${productImages.productId} = ${products.id}
)`;

/** What an association's public profile lacks, most visible first. */
export function profileGaps(association: {
  description: string | null;
  zone: string | null;
  coverObjectKey: string | null;
  whatsappNumber: string | null;
}) {
  // Logo and photos are optional extras; these shape the directory, the
  // profile and where buyers' messages go (without a number, the product
  // buttons write to the alliance instead).
  return [
    association.description ? null : "sin descripción",
    association.zone ? null : "sin zona en el mapa",
    association.coverObjectKey ? null : "sin portada",
    association.whatsappNumber ? null : "sin WhatsApp",
  ].filter((gap): gap is string => gap !== null);
}

export function sentence(gaps: string[]) {
  const text =
    gaps.length > 1
      ? `${gaps.slice(0, -1).join(", ")} y ${gaps[gaps.length - 1]}`
      : gaps[0];
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Products the public could see, were it not for what the row says. */
const isVisiblePublished = and(
  eq(products.status, "PUBLISHED"),
  eq(associations.status, "ACTIVE"),
);

/**
 * A published product's problems that only its page would show: hidden by
 * an inactive category, no photo, no short description. One row per
 * product; the action goes where the first problem is fixed.
 */
function productTask(product: {
  id: string;
  name: string;
  categoryIsActive: boolean;
  hasImages: boolean;
  shortDescription: string | null;
}): PendingTask | null {
  const gaps = [
    product.categoryIsActive ? null : "no se ve: su categoría está inactiva",
    product.hasImages ? null : "sin foto",
    product.shortDescription?.trim() ? null : "sin descripción corta",
  ].filter((gap): gap is string => gap !== null);
  if (gaps.length === 0) return null;

  const onlyPhoto = gaps.length === 1 && !product.hasImages;
  return {
    id: `producto-${product.id}`,
    subject: product.name,
    missing: onlyPhoto ? "No tiene foto" : sentence(gaps),
    action: onlyPhoto ? "Agregar" : "Revisar",
    href: onlyPhoto
      ? `/admin/products/${product.id}/images/new`
      : `/admin/products/${product.id}`,
  };
}

/**
 * What is missing, as rows that each lead to the task. Only what a list or
 * the storefront would not show without opening each item:
 * - an association administrator: drafts that cannot be published yet; their
 *   products on the storefront (published or paused) that are hidden by an
 *   inactive category, lack a photo or a short description; and the public
 *   profile's gaps (description, map zone, cover, WhatsApp);
 * - the alliance: its own WhatsApp when none is configured, invitations not
 *   accepted, active associations nobody administers, published products
 *   with those same problems, and active associations' profile gaps.
 * Logo, association photos and prices are optional («Consultar» is a valid
 * price) and never counted.
 */
export async function getPendingTasks(
  profile: AdminProfile,
): Promise<PendingTask[]> {
  const ownAssociation = isAssociationAdmin(profile)
    ? profile.associationId
    : null;

  const [drafts, productRows, associationRows] = await Promise.all([
    ownAssociation
      ? getAssociationDashboard(profile).then((dashboard) =>
          (dashboard?.drafts ?? []).map((draft): PendingTask => ({
            id: `borrador-${draft.id}`,
            subject: draft.name,
            missing:
              draft.missing[0] ?? "Está listo, pero aún no se ve en la vitrina",
            action: draft.missing.length > 0 ? "Completar" : "Publicar",
            href: `/admin/products/${draft.id}`,
          })),
        )
      : Promise.resolve([]),
    db
      .select({
        id: products.id,
        name: products.name,
        shortDescription: products.shortDescription,
        categoryIsActive: categories.isActive,
        hasImages: sql<boolean>`not ${hasNoImages}`,
      })
      .from(products)
      .innerJoin(associations, eq(products.associationId, associations.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(
        ownAssociation
          ? and(
              eq(products.associationId, ownAssociation),
              ne(products.status, "DRAFT"),
            )
          : isVisiblePublished,
      )
      .orderBy(asc(products.name)),
    db
      .select({
        id: associations.id,
        name: associations.name,
        description: associations.description,
        zone: associations.zone,
        coverObjectKey: associations.coverObjectKey,
        whatsappNumber: associations.whatsappNumber,
        // Explicit names: in a single-table select Drizzle leaves columns
        // unqualified, which would compare the profile with itself here.
        activeAccounts: sql<number>`(
          select count(*)::int from profiles as account
          where account.association_id = "associations"."id"
            and account.status = 'ACTIVE'
        )`,
      })
      .from(associations)
      .where(
        ownAssociation
          ? eq(associations.id, ownAssociation)
          : eq(associations.status, "ACTIVE"),
      )
      .orderBy(asc(associations.name)),
  ]);

  const productTasks = productRows
    .map(productTask)
    .filter((task): task is PendingTask => task !== null);

  const profileTasks = associationRows.flatMap((association): PendingTask[] => {
    const gaps = profileGaps(association);
    if (gaps.length === 0) return [];
    return [
      {
        id: `perfil-${association.id}`,
        subject: ownAssociation ? "Tu asociación" : association.name,
        missing: sentence(gaps),
        action: "Completar",
        href: ownAssociation
          ? "/admin/association"
          : `/admin/associations/${association.id}/edit`,
      },
    ];
  });

  if (ownAssociation) {
    return [...drafts, ...productTasks, ...profileTasks];
  }

  const [invitations, allianceWhatsApp] = await Promise.all([
    db
      .select({ id: profiles.id, name: profiles.name })
      .from(profiles)
      .where(isNotNull(profiles.invitationId))
      .orderBy(asc(profiles.name)),
    getAllianceWhatsAppNumber(),
  ]);

  const unmanaged = associationRows
    .filter((association) => association.activeAccounts === 0)
    .map((association): PendingTask => ({
      id: `sin-cuenta-${association.id}`,
      subject: association.name,
      missing: "Nadie la administra en el panel",
      action: "Invitar",
      href: `/admin/users/new?asociacion=${association.id}`,
    }));

  return [
    ...(allianceWhatsApp
      ? []
      : [
          {
            id: "whatsapp-alianza",
            subject: "Contacto de la alianza",
            missing: "Sin WhatsApp: los botones de contacto no se muestran",
            action: "Agregar",
            href: "/admin/content/alliance_whatsapp/edit",
          },
        ]),
    ...invitations.map((person): PendingTask => ({
      id: `invitacion-${person.id}`,
      subject: person.name,
      missing: "No ha aceptado la invitación",
      action: "Revisar",
      href: `/admin/users/${person.id}/edit`,
    })),
    ...unmanaged,
    ...productTasks,
    ...profileTasks,
  ];
}
