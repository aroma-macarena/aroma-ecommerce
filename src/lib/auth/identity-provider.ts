import "server-only";

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

/** Revokes an invitation; one already used, revoked or expired is ignored. */
export async function revokeInvitation(invitationId: string) {
  const client = await clerkClient();

  try {
    await client.invitations.revokeInvitation(invitationId);
  } catch {
    // Revoking is cleanup: an invitation that cannot be revoked any more no
    // longer lets anyone in without a matching AROMA profile.
  }
}
