import "server-only";

import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { clerkClient } from "@clerk/nextjs/server";

import { getAbsoluteUrl } from "@/lib/public-routes";

/**
 * The few Clerk operations AROMA needs to provision administrators. Clerk
 * authenticates people; AROMA decides what they may do. Everything here runs
 * on the server with CLERK_SECRET_KEY and returns only what callers need.
 */

/** Raised when Clerk cannot complete a request, so callers can explain it. */
export class IdentityProviderError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "IdentityProviderError";
  }
}

async function call<T>(run: () => Promise<T>, message: string) {
  try {
    return await run();
  } catch (error) {
    throw new IdentityProviderError(message, { cause: error });
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** The Clerk user that owns this email, verified, or null if none does. */
export async function findUserIdByEmail(email: string) {
  const target = normalizeEmail(email);
  const client = await clerkClient();
  // Clerk matches emails partially, so the result is checked exactly.
  const { data } = await call(
    () => client.users.getUserList({ emailAddress: [target], limit: 10 }),
    "No pudimos consultar las cuentas de acceso.",
  );

  const user = data.find((candidate) =>
    candidate.emailAddresses.some(
      (address) =>
        normalizeEmail(address.emailAddress) === target &&
        address.verification?.status === "verified",
    ),
  );

  return user?.id ?? null;
}

/** A Clerk user's verified emails, lowercased. */
export async function getVerifiedEmails(userId: string) {
  const client = await clerkClient();
  const user = await call(
    () => client.users.getUser(userId),
    "No pudimos consultar la cuenta de acceso.",
  );

  return user.emailAddresses
    .filter((address) => address.verification?.status === "verified")
    .map((address) => normalizeEmail(address.emailAddress));
}

/**
 * Sends a Clerk invitation. Accepting it creates the account through the
 * invitation-only sign-up page, so public self-registration stays closed.
 */
export async function createInvitation(email: string) {
  const client = await clerkClient();
  const redirectUrl = getAbsoluteUrl("/admin/sign-up") ?? undefined;
  const invitation = await call(
    () =>
      client.invitations.createInvitation({
        emailAddress: normalizeEmail(email),
        redirectUrl,
        notify: true,
      }),
    "No pudimos enviar la invitación.",
  );

  return invitation.id;
}

/**
 * Whether Clerk refused because the invitation can no longer be used:
 * already accepted, revoked or expired, or unknown. Outages, rate limits
 * and network errors are not, so the caller can retry.
 */
function isUnusableInvitationError(error: unknown) {
  return (
    isClerkAPIResponseError(error) &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 429
  );
}

/**
 * Revokes an invitation. One that is already unusable counts as revoked;
 * any other failure raises `IdentityProviderError`, so nothing that depends
 * on the revocation happens and it can be retried.
 */
export async function revokeInvitation(invitationId: string) {
  const client = await clerkClient();

  try {
    await client.invitations.revokeInvitation(invitationId);
  } catch (error) {
    if (isUnusableInvitationError(error)) {
      return;
    }
    throw new IdentityProviderError("No pudimos anular la invitación.", {
      cause: error,
    });
  }
}

/** Cleanup after a failed save: a leftover invitation is not worth an error. */
export async function revokeInvitationQuietly(invitationId: string) {
  await revokeInvitation(invitationId).catch(() => undefined);
}
