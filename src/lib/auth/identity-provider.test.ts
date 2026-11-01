import { ClerkAPIResponseError } from "@clerk/nextjs/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  IdentityProviderError,
  revokeInvitation,
} from "@/lib/auth/identity-provider";

const clerk = vi.hoisted(() => ({ revokeInvitation: vi.fn() }));

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: async () => ({
    invitations: { revokeInvitation: clerk.revokeInvitation },
  }),
}));

function clerkError(status: number) {
  return new ClerkAPIResponseError("Clerk error", { data: [], status });
}

beforeEach(() => {
  clerk.revokeInvitation.mockReset();
});

describe("revokeInvitation", () => {
  it("revokes a pending invitation", async () => {
    clerk.revokeInvitation.mockResolvedValueOnce({});

    await expect(revokeInvitation("inv_1")).resolves.toBeUndefined();
    expect(clerk.revokeInvitation).toHaveBeenCalledWith("inv_1");
  });

  it("treats an invitation Clerk says is unusable as revoked", async () => {
    clerk.revokeInvitation.mockRejectedValueOnce(clerkError(400));

    await expect(revokeInvitation("inv_1")).resolves.toBeUndefined();
  });

  it.each([
    ["an outage", clerkError(503)],
    ["a rate limit", clerkError(429)],
    ["a network error", new TypeError("fetch failed")],
  ])("raises on %s so it can be retried", async (_, error) => {
    clerk.revokeInvitation.mockRejectedValueOnce(error);

    await expect(revokeInvitation("inv_1")).rejects.toBeInstanceOf(
      IdentityProviderError,
    );
  });
});
