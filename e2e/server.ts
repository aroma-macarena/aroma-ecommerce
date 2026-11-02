import { spawn } from "node:child_process";

import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

import { E2E_APP_PORT, E2E_DATABASE_PORT, e2eEnvironment } from "./environment";
import { seedE2eDatabase } from "./seed";

/**
 * Starts the isolated stack for Playwright's web server: an in-memory
 * PGlite with the real migrations and the end-to-end data, served as
 * PostgreSQL on a local port, and the app built by `e2e/build.ts` on top.
 * Everything lives in memory and starts fresh on every run.
 */
async function main() {
  const database = new PGlite();
  await migrate(drizzle(database), { migrationsFolder: "./drizzle" });
  await seedE2eDatabase(drizzle(database));

  const socketServer = new PGLiteSocketServer({
    db: database,
    host: "127.0.0.1",
    port: E2E_DATABASE_PORT,
  });
  await socketServer.start();

  const app = spawn(
    "pnpm",
    ["exec", "next", "start", "--port", String(E2E_APP_PORT)],
    { env: { ...process.env, ...e2eEnvironment }, stdio: "inherit" },
  );

  async function stop() {
    app.kill("SIGTERM");
    await socketServer.stop();
    await database.close();
  }

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      void stop().then(() => process.exit(0));
    });
  }

  app.on("exit", (code) => {
    void socketServer
      .stop()
      .then(() => database.close())
      .then(() => process.exit(code ?? 1));
  });
}

main().catch((error) => {
  console.error("Could not start the end-to-end environment:");
  console.error(error);
  process.exit(1);
});
