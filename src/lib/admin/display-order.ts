import { type SQL, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/**
 * The ids in their new order after moving `id` one place, or `null` when it
 * is not in the list. At either edge the order stays as it is.
 */
export function moveInOrder(
  ids: string[],
  id: string,
  direction: "up" | "down",
) {
  const index = ids.indexOf(id);

  if (index === -1) {
    return null;
  }

  const target = direction === "up" ? index - 1 : index + 1;
  const reordered = [...ids];

  if (target >= 0 && target < ids.length) {
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];
  }

  return reordered;
}

/**
 * `display_order` for each id by its position, from 0, as one CASE
 * expression, so a single UPDATE renumbers every row and repairs repeats.
 */
export function displayOrderByPosition(idColumn: PgColumn, ids: string[]): SQL {
  return sql`case ${idColumn} ${sql.join(
    ids.map((id, order) => sql`when ${id}::uuid then ${order}::integer`),
    sql` `,
  )} end`;
}
