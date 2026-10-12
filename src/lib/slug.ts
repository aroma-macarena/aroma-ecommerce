const MAX_SLUG_LENGTH = 200;

/** URL-safe slug from free text: lowercase ASCII words joined by hyphens. */
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

/**
 * First free slug among `base`, `base-2`, `base-3`… given the slugs already
 * taken. Suffixes keep the result within the maximum slug length.
 */
export function nextAvailableSlug(base: string, takenSlugs: Iterable<string>) {
  const taken = new Set(takenSlugs);
  const root = base || "producto";

  if (!taken.has(root)) {
    return root;
  }

  for (let suffix = 2; ; suffix++) {
    const ending = `-${suffix}`;
    const candidate = `${root.slice(0, MAX_SLUG_LENGTH - ending.length)}${ending}`;

    if (!taken.has(candidate)) {
      return candidate;
    }
  }
}
