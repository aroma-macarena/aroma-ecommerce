import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in the .env.local file");
}

/**
 * Neon's HTTP driver in every real environment. The end-to-end suite sets
 * DATABASE_DRIVER=node-postgres to reach a local PostgreSQL server (PGlite
 * behind a socket) that Neon's driver cannot talk to. Both expose the same
 * query builder; code that needs a transaction already handles drivers
 * without Neon's batch, as the Vitest suite does with PGlite.
 */
function createDatabase(url: string) {
  if (process.env.DATABASE_DRIVER === "node-postgres") {
    // One connection: PGlite serves one at a time.
    const pool = new Pool({ connectionString: url, max: 1 });
    return drizzleNodePostgres(pool) as unknown as ReturnType<typeof drizzle>;
  }

  return drizzle(neon(url));
}

export const db = createDatabase(connectionString);
