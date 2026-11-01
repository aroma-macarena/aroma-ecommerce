export type AssociationImageKind = "logo" | "cover";

/** Longest side of each association image after the browser reduces it. */
export const ASSOCIATION_IMAGE_MAX_DIMENSION: Record<
  AssociationImageKind,
  number
> = {
  logo: 800,
  cover: 2400,
};

/**
 * Object key for an association image:
 * `associations/{associationId}/{kind}-{uuid}.{extension}`. A new key for
 * every upload, so a replaced image never collides with the current one.
 */
export function associationImageKey(
  associationId: string,
  kind: AssociationImageKind,
  extension: string,
) {
  return `associations/${associationId}/${kind}-${crypto.randomUUID()}.${extension}`;
}
