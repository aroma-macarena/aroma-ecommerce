import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { profilesTable } from "@/db/schema/profiles";
import getCurrentProfile from "@/lib/auth/get-current-profile";
import { getVerifiedEmails } from "@/lib/auth/identity-provider";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import { ids, seedCatalog, seedProfiles } from "@/test/fixtures";

const database = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@/db", () => ({
  get db() {
    return (database.current as TestDatabase).db;
  },
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
vi.mock("@/lib/auth/identity-provider", () => ({
  getVerifiedEmails: vi.fn(async () => []),
}));

const mockAuth = vi.mocked(auth);
const mockVerifiedEmails = vi.mocked(getVerifiedEmails);

function signInAs(userId: string | null) {
  mockAuth.mockResolvedValue({
    isAuthenticated: userId !== null,
    userId,
  } as Awaited<ReturnType<typeof auth>>);
}

let testDatabase: TestDatabase;

async function storedProfile(email: string) {
  const [profile] = await testDatabase.db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.email, email));
  return profile;
}

beforeAll(async () => {
  testDatabase = await createTestDatabase();
  database.current = testDatabase;

  await seedCatalog(testDatabase);
  await seedProfiles(testDatabase, [
    {
      authUserId: "user_super",
      name: "Superadministrador",
      email: "super@aroma.test",
      role: "SUPER_ADMIN",
    },
    {
      authUserId: "user_bosque",
      name: "Admin Bosque Vivo",
      email: "bosque@aroma.test",
      role: "ASSOCIATION_ADMIN",
      associationId: ids.associations.bosqueVivo,
    },
    {
      authUserId: "user_paused",
      name: "Admin pausado",
      email: "pausado@aroma.test",
      role: "ASSOCIATION_ADMIN",
      associationId: ids.associations.bosqueVivo,
      status: "INACTIVE",
    },
    {
      authUserId: "user_inactive_association",
      name: "Admin de asociación inactiva",
      email: "inactiva@aroma.test",
      role: "ASSOCIATION_ADMIN",
      associationId: ids.associations.inactive,
    },
    {
      invitationId: "inv_new",
      name: "Admin invitada",
      email: "invitada@aroma.test",
      role: "ASSOCIATION_ADMIN",
      associationId: ids.associations.bosqueVivo,
    },
    {
      invitationId: "inv_paused",
      name: "Invitada pausada",
      email: "invitada.pausada@aroma.test",
      role: "SUPER_ADMIN",
      status: "INACTIVE",
    },
  ]);
});

describe("getCurrentProfile", () => {
  it("reports a visitor without a session", async () => {
    signInAs(null);

    await expect(getCurrentProfile()).resolves.toEqual({
      status: "UNAUTHENTICATED",
    });
  });

  it("reports a signed-in user without an AROMA profile", async () => {
    signInAs("user_unknown");

    await expect(getCurrentProfile()).resolves.toEqual({
      status: "PROFILE_NOT_FOUND",
    });
  });

  it("returns an active super administrator without an association", async () => {
    signInAs("user_super");

    await expect(getCurrentProfile()).resolves.toMatchObject({
      status: "ACTIVE",
      currentProfile: {
        role: "SUPER_ADMIN",
        email: "super@aroma.test",
        associationId: null,
        associationName: null,
      },
    });
  });

  it("returns an active association administrator with their association", async () => {
    signInAs("user_bosque");

    await expect(getCurrentProfile()).resolves.toMatchObject({
      status: "ACTIVE",
      currentProfile: {
        role: "ASSOCIATION_ADMIN",
        associationId: ids.associations.bosqueVivo,
        associationName: "Asociación Bosque Vivo",
      },
    });
  });

  it("blocks an inactive profile and says who is blocked", async () => {
    signInAs("user_paused");

    await expect(getCurrentProfile()).resolves.toEqual({
      status: "INACTIVE",
      account: {
        email: "pausado@aroma.test",
        associationName: "Asociación Bosque Vivo",
      },
    });
  });

  it("blocks an administrator whose association is inactive", async () => {
    signInAs("user_inactive_association");

    await expect(getCurrentProfile()).resolves.toEqual({
      status: "ASSOCIATION_INACTIVE",
      account: {
        email: "inactiva@aroma.test",
        associationName: "Asociación Inactiva",
      },
    });
  });

  it("links an invited profile on its first sign-in by verified email", async () => {
    signInAs("user_invited");
    mockVerifiedEmails.mockResolvedValueOnce(["invitada@aroma.test"]);

    await expect(getCurrentProfile()).resolves.toMatchObject({
      status: "ACTIVE",
      currentProfile: {
        role: "ASSOCIATION_ADMIN",
        email: "invitada@aroma.test",
        associationId: ids.associations.bosqueVivo,
      },
    });
    expect(await storedProfile("invitada@aroma.test")).toMatchObject({
      authUserId: "user_invited",
      invitationId: null,
    });
  });

  it("keeps a linked invited profile inactive when it was deactivated", async () => {
    signInAs("user_invited_paused");
    mockVerifiedEmails.mockResolvedValueOnce(["invitada.pausada@aroma.test"]);

    await expect(getCurrentProfile()).resolves.toMatchObject({
      status: "INACTIVE",
    });
  });

  it("does not hand a profile that is already linked to another user", async () => {
    signInAs("user_impostor");
    mockVerifiedEmails.mockResolvedValueOnce(["super@aroma.test"]);

    await expect(getCurrentProfile()).resolves.toEqual({
      status: "PROFILE_NOT_FOUND",
    });
    expect((await storedProfile("super@aroma.test")).authUserId).toBe(
      "user_super",
    );
  });

  it("reports no profile when Clerk cannot be reached", async () => {
    signInAs("user_offline");
    mockVerifiedEmails.mockRejectedValueOnce(new Error("Clerk unavailable"));

    await expect(getCurrentProfile()).resolves.toEqual({
      status: "PROFILE_NOT_FOUND",
    });
  });
});
