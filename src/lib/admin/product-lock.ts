import { eq } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";

import { db } from "@/db";
import { productsTable as products } from "@/db/schema/products";

type Executor = typeof db;

/**
 * Runs writes in one transaction after locking one row (`select … for
 * update`), so writes that depend on that row's children happen one at a
 * time per row. Each statement then sees what earlier ones committed,
 * instead of two requests both counting the same children: two uploads
 * both seeing seven of eight photos, or two removals each counting on a
 * presentation the other is removing.
 *
 * Neon's HTTP driver has no interactive transactions, but a batch runs as a
 * single transaction. Drivers without batches (PGlite in tests) use
 * `transaction` with the same statements.
 *
 * Returns the result of each write, in order.
 */
export async function withRowLock<T extends unknown[]>(
  lock: (executor: Executor) => BatchItem<"pg">,
  writes: (executor: Executor) => [BatchItem<"pg">, ...BatchItem<"pg">[]],
): Promise<T> {
  if ("batch" in db && typeof db.batch === "function") {
    const [, ...results] = await db.batch([lock(db), ...writes(db)]);
    return results as unknown as T;
  }

  const transactional = db as unknown as {
    transaction: <R>(run: (tx: Executor) => Promise<R>) => Promise<R>;
  };

  return transactional.transaction(async (tx) => {
    await lock(tx);
    const results = [];
    for (const write of writes(tx)) {
      results.push(await write);
    }
    return results as unknown as T;
  });
}

/** `withRowLock` on a product's row: its presentations and images. */
export async function withProductLock<T extends unknown[]>(
  productId: string,
  writes: (executor: Executor) => [BatchItem<"pg">, ...BatchItem<"pg">[]],
): Promise<T> {
  return withRowLock<T>(
    (executor) =>
      executor
        .select({ id: products.id })
        .from(products)
        .where(eq(products.id, productId))
        .for("update"),
    writes,
  );
}
