import { and, asc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { productPresentationsTable as productPresentations } from "@/db/schema/productPresentations";
import { productsTable as products } from "@/db/schema/products";
import type {
  PresentationFieldErrors,
  PresentationFormInput,
} from "@/lib/admin/presentation-form";
import { getEditableProduct } from "@/lib/admin/product-mutations";
import type { AdminProfile } from "@/lib/auth/get-current-profile";

export type PresentationMutationResult =
  | { ok: true }
  | { ok: false; reason: "INVALID"; fieldErrors: PresentationFieldErrors }
  | { ok: false; reason: "NOT_FOUND" | "LAST_AVAILABLE" };

export const lastAvailableMessage =
  "Es la única presentación disponible de un producto publicado. Agrega otra disponible o pausa el producto primero.";

const presentationColumns = {
  id: productPresentations.id,
  name: productPresentations.name,
  quantity: productPresentations.quantity,
  unit: productPresentations.unit,
  referencePrice: productPresentations.referencePrice,
  isAvailable: productPresentations.isAvailable,
  displayOrder: productPresentations.displayOrder,
};

const presentationOrder = [
  asc(productPresentations.displayOrder),
  asc(productPresentations.createdAt),
  asc(productPresentations.id),
];

/**
 * True when removing this presentation from the available ones would leave
 * a published product without any. Written as SQL so it can guard the write
 * itself and not only a previous read.
 */
const leavesPublishedProductUnavailable = sql`(
  ${productPresentations.isAvailable}
  and exists (
    select 1 from ${products}
    where ${products.id} = ${productPresentations.productId}
      and ${products.status} = 'PUBLISHED'
  )
  and not exists (
    select 1 from ${productPresentations} as other
    where other.product_id = ${productPresentations.productId}
      and other.id <> ${productPresentations.id}
      and other.is_available
  )
)`;

/** Presentations of a product, in display order. */
export async function getProductPresentations(productId: string) {
  const presentations = await db
    .select(presentationColumns)
    .from(productPresentations)
    .where(eq(productPresentations.productId, productId))
    .orderBy(...presentationOrder);

  return presentations;
}

export type ProductPresentation = Awaited<
  ReturnType<typeof getProductPresentations>
>[number];

/**
 * A presentation of a product the profile may manage, with whether it is the
 * only one keeping a published product available; otherwise null.
 */
export async function getEditablePresentation(
  profile: AdminProfile,
  productId: string,
  presentationId: string,
) {
  const product = await getEditableProduct(profile, productId);

  if (!product) {
    return null;
  }

  const presentations = await getProductPresentations(product.id);
  const presentation = presentations.find(({ id }) => id === presentationId);

  if (!presentation) {
    return null;
  }

  return {
    product,
    presentation,
    isLastAvailable:
      product.status === "PUBLISHED" &&
      presentation.isAvailable &&
      presentations.every(
        (other) => other.id === presentation.id || !other.isAvailable,
      ),
  };
}

/** Records who changed the product through its presentations, and when. */
async function touchProduct(profile: AdminProfile, productId: string) {
  await db
    .update(products)
    .set({ updatedBy: profile.id, updatedAt: sql`now()` })
    .where(eq(products.id, productId));
}

export async function createPresentation(
  profile: AdminProfile,
  productId: string,
  input: PresentationFormInput,
): Promise<PresentationMutationResult> {
  const product = await getEditableProduct(profile, productId);

  if (!product) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  await db.insert(productPresentations).values({
    productId: product.id,
    ...input,
    displayOrder: sql`(
      select coalesce(max(${productPresentations.displayOrder}) + 1, 0)
      from ${productPresentations}
      where ${productPresentations.productId} = ${product.id}
    )`,
  });
  await touchProduct(profile, product.id);

  return { ok: true };
}

export async function updatePresentation(
  profile: AdminProfile,
  productId: string,
  presentationId: string,
  input: PresentationFormInput,
): Promise<PresentationMutationResult> {
  const editable = await getEditablePresentation(
    profile,
    productId,
    presentationId,
  );

  if (!editable) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const updated = await db
    .update(productPresentations)
    .set({ ...input, updatedAt: sql`now()` })
    .where(
      and(
        eq(productPresentations.id, presentationId),
        eq(productPresentations.productId, editable.product.id),
        input.isAvailable
          ? undefined
          : sql`not ${leavesPublishedProductUnavailable}`,
      ),
    )
    .returning({ id: productPresentations.id });

  if (updated.length === 0) {
    return {
      ok: false,
      reason: "INVALID",
      fieldErrors: { isAvailable: lastAvailableMessage },
    };
  }

  await touchProduct(profile, editable.product.id);

  return { ok: true };
}

export async function deletePresentation(
  profile: AdminProfile,
  productId: string,
  presentationId: string,
): Promise<PresentationMutationResult> {
  const editable = await getEditablePresentation(
    profile,
    productId,
    presentationId,
  );

  if (!editable) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const deleted = await db
    .delete(productPresentations)
    .where(
      and(
        eq(productPresentations.id, presentationId),
        eq(productPresentations.productId, editable.product.id),
        sql`not ${leavesPublishedProductUnavailable}`,
      ),
    )
    .returning({ id: productPresentations.id });

  if (deleted.length === 0) {
    return { ok: false, reason: "LAST_AVAILABLE" };
  }

  await touchProduct(profile, editable.product.id);

  return { ok: true };
}

/**
 * Swaps a presentation with its neighbor and renumbers the product's
 * presentations from 0 in one statement, which also repairs repeated orders.
 */
export async function movePresentation(
  profile: AdminProfile,
  productId: string,
  presentationId: string,
  direction: "up" | "down",
): Promise<PresentationMutationResult> {
  const product = await getEditableProduct(profile, productId);

  if (!product) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const ids = (await getProductPresentations(product.id)).map(({ id }) => id);
  const index = ids.indexOf(presentationId);

  if (index === -1) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const target = direction === "up" ? index - 1 : index + 1;

  if (target < 0 || target >= ids.length) {
    return { ok: true };
  }

  [ids[index], ids[target]] = [ids[target], ids[index]];

  await db
    .update(productPresentations)
    .set({
      displayOrder: sql`case ${productPresentations.id} ${sql.join(
        ids.map((id, order) => sql`when ${id}::uuid then ${order}::integer`),
        sql` `,
      )} end`,
    })
    .where(
      and(
        eq(productPresentations.productId, product.id),
        inArray(productPresentations.id, ids),
      ),
    );
  await touchProduct(profile, product.id);

  return { ok: true };
}
