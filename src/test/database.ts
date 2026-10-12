import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

/**
 * In-memory PostgreSQL with the project's real migrations applied.
 * Tests run queries against it instead of Neon, without credentials.
 */
export async function createTestDatabase() {
  const client = new PGlite();
  const db = drizzle(client);

  await migrate(db, { migrationsFolder: "./drizzle" });

  return { client, db };
}

export type TestDatabase = Awaited<ReturnType<typeof createTestDatabase>>;
