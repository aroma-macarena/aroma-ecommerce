import { defineConfig, devices } from "@playwright/test";

import { E2E_BASE_URL } from "./e2e/environment";

const isCI = Boolean(process.env.CI);

/**
 * Browser journeys against the app built by `pnpm test:e2e`, served with an
 * in-memory database and no external services (see `e2e/server.ts`).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  // One in-memory database serves every test.
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [["github"], ["html", { open: "never" }], ["list"]]
    : [["list"], ["html", { open: "on-failure" }]],
  use: {
    baseURL: E2E_BASE_URL,
    locale: "es-CO",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      // A local Chromium when Playwright's own is not installed.
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm exec tsx e2e/server.ts",
    url: `${E2E_BASE_URL}/`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
