import { spawnSync } from "node:child_process";

import { e2eEnvironment } from "./environment";

/**
 * Builds the app for the end-to-end suite into its own directory, with the
 * isolated environment: public variables are fixed at build time.
 */
const result = spawnSync("pnpm", ["exec", "next", "build"], {
  env: { ...process.env, ...e2eEnvironment },
  stdio: "inherit",
});

process.exit(result.status ?? 1);
