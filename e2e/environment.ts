/**
 * The isolated environment the end-to-end suite builds and runs the app
 * with. Every variable the app reads is set here, so nothing comes from
 * `.env.local` and no real Neon, Clerk or R2 credentials are involved.
 */

export const E2E_APP_PORT = 3100;
export const E2E_DATABASE_PORT = 5499;
export const E2E_BASE_URL = `http://127.0.0.1:${E2E_APP_PORT}`;
export const E2E_DIST_DIR = ".next-e2e";

/** WhatsApp number of the seeded association, as stored. */
export const E2E_WHATSAPP_NUMBER = "573001112233";

/**
 * Clerk keys in a valid format that point to no instance (`.invalid` is a
 * reserved domain). Without a session, Clerk makes no network calls, so the
 * app treats every visitor as signed out: enough to check that admin
 * routes send people to sign in, never enough to sign anyone in.
 */
const INERT_CLERK_PUBLISHABLE_KEY = `pk_live_${Buffer.from(
  "clerk.aroma-e2e.invalid$",
).toString("base64")}`;
const INERT_CLERK_SECRET_KEY = "sk_live_aroma_e2e_inert_key";

export const e2eEnvironment: Record<string, string> = {
  NODE_ENV: "production",
  NEXT_DIST_DIR: E2E_DIST_DIR,
  NEXT_TELEMETRY_DISABLED: "1",

  DATABASE_DRIVER: "node-postgres",
  DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:${E2E_DATABASE_PORT}/postgres`,
  DATABASE_URL_UNPOOLED: "",
  ALLOW_DB_SEED: "false",

  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: INERT_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: INERT_CLERK_SECRET_KEY,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/admin/sign-in",
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "/admin",
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/admin/sign-up",
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "/admin",

  // No media storage: products show their placeholder image.
  NEXT_PUBLIC_MEDIA_BASE_URL: "",
  R2_ACCOUNT_ID: "",
  R2_ACCESS_KEY_ID: "",
  R2_SECRET_ACCESS_KEY: "",
  R2_BUCKET: "",

  NEXT_PUBLIC_SITE_URL: E2E_BASE_URL,
  ALLIANCE_SUPPORT_WHATSAPP: "",
};
