import { clerkTestInstance } from "./environment";

/**
 * The Clerk test users of the authenticated journeys. Their `+clerk_test`
 * emails are Clerk's test addresses: no email is ever delivered. The E2E
 * seed leaves pending AROMA profiles with these emails, and the app links
 * them on the first sign-in, as with any invitation.
 */
export const e2eAdmins = {
  superAdmin: {
    email: "aroma-e2e-superadmin+clerk_test@example.com",
    name: "Superadministradora E2E",
  },
  associationAdmin: {
    email: "aroma-e2e-asociacion+clerk_test@example.com",
    name: "Administradora E2E",
  },
} as const;

type ClerkUser = { id: string };

async function clerkApi<T>(path: string, init?: RequestInit): Promise<T> {
  if (!clerkTestInstance) {
    throw new Error("No Clerk development instance is configured.");
  }

  const response = await fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${clerkTestInstance.secretKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Clerk API ${init?.method ?? "GET"} ${path} failed: ${response.status} ${await response.text()}`,
    );
  }

  return response.json() as Promise<T>;
}

/** Creates the test users that do not exist yet in the development instance. */
export async function ensureClerkTestUsers() {
  for (const { email } of Object.values(e2eAdmins)) {
    const existing = await clerkApi<ClerkUser[]>(
      `/users?email_address=${encodeURIComponent(email)}`,
    );

    if (existing.length === 0) {
      await clerkApi<ClerkUser>("/users", {
        method: "POST",
        body: JSON.stringify({
          email_address: [email],
          skip_password_requirement: true,
        }),
      });
    }
  }
}
