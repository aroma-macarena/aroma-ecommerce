import { eq } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";

import { db } from "@/db";
import { productsTable as products } from "@/db/schema/products";

type Executor = typeof db;

/**
 * Runs writes in one transaction after locking the product's row, so changes
 * that depend on a product's presentations happen one at a time per product.
 * Each statement then sees what earlier ones committed, instead of two
 * requests each counting on a presentation the other is removing.
 *
 * Neon's HTTP driver has no interactive transactions, but a batch runs as a
 * single transaction. Drivers without batches (PGlite in tests) use
 * `transaction` with the same statements.
 *
 * Returns the result of each write, in order.
 */
export async function withProductLock<T extends unknown[]>(
  productId: string,
  writes: (executor: Executor) => [BatchItem<"pg">, ...BatchItem<"pg">[]],
): Promise<T> {
  const lock = (executor: Executor) =>
    executor
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .for("update");

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
