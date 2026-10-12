const MAX_SLUG_LENGTH = 200;
/** Room for a hyphen and up to nine suffix digits. */
const MAX_SUFFIX_LENGTH = 10;

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
 * Prefix shared by every candidate `nextAvailableSlug` can return for `base`,
 * including suffixed ones whose root was shortened to fit the maximum length.
 */
export function slugCandidatePrefix(base: string) {
  return (base || "producto").slice(0, MAX_SLUG_LENGTH - MAX_SUFFIX_LENGTH);
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
