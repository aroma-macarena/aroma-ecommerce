import { clerkSetup } from "@clerk/testing/playwright";

import { ensureClerkTestUsers } from "./clerk-users";
import { clerkTestInstance } from "./environment";

/**
 * With a Clerk development instance, fetches a testing token (so Clerk's
 * bot protection lets the browser in) and makes sure the test users exist.
 * Without one, there is nothing to set up.
 */
export default async function globalSetup() {
  if (!clerkTestInstance) {
    return;
  }

  // Read by @clerk/testing's helpers in the test workers.
  process.env.CLERK_PUBLISHABLE_KEY = clerkTestInstance.publishableKey;
  process.env.CLERK_SECRET_KEY = clerkTestInstance.secretKey;

  await clerkSetup({
    publishableKey: clerkTestInstance.publishableKey,
    secretKey: clerkTestInstance.secretKey,
  });
  await ensureClerkTestUsers();
}
