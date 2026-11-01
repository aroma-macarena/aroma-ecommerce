const MAX_SLUG_ATTEMPTS = 3;

export function isUniqueViolation(error: unknown) {
  const code = (error as { code?: string })?.code;
  const causeCode = (error as { cause?: { code?: string } })?.cause?.code;
  return code === "23505" || causeCode === "23505";
}

/**
 * Retries a save when another one takes the same slug at the same time; the
 * save picks the next free slug on each attempt.
 */
export async function withUniqueSlug<T>(save: () => Promise<T>) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await save();
    } catch (error) {
      if (!isUniqueViolation(error) || attempt >= MAX_SLUG_ATTEMPTS) {
        throw error;
      }
    }
  }
}
