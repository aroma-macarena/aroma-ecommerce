const MAX_SLUG_ATTEMPTS = 3;

type DatabaseError = { code?: string; constraint?: string };

function databaseError(error: unknown): DatabaseError | undefined {
  // Drivers report the Postgres error directly or as the cause.
  const direct = error as DatabaseError | undefined;
  return direct?.code
    ? direct
    : (error as { cause?: DatabaseError } | undefined)?.cause;
}

/**
 * Whether the error is a unique violation, optionally of a given constraint
 * or index name.
 */
export function isUniqueViolation(error: unknown, constraint?: string) {
  const details = databaseError(error);
  return (
    details?.code === "23505" &&
    (!constraint || details.constraint === constraint)
  );
}

/**
 * Retries a save when another one takes the same slug at the same time; the
 * save picks the next free slug on each attempt. With `slugConstraint`, only
 * that constraint is retried, so other unique violations reach the caller.
 */
export async function withUniqueSlug<T>(
  save: () => Promise<T>,
  slugConstraint?: string,
) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await save();
    } catch (error) {
      if (
        !isUniqueViolation(error, slugConstraint) ||
        attempt >= MAX_SLUG_ATTEMPTS
      ) {
        throw error;
      }
    }
  }
}
