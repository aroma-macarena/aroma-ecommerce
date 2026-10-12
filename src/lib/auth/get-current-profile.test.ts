import { auth } from "@clerk/nextjs/server";
import { beforeAll, describe, expect, it, vi } from "vitest";

import getCurrentProfile from "@/lib/auth/get-current-profile";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import { ids, seedCatalog, seedProfiles } from "@/test/fixtures";

const database = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@/db", () => ({
  get db() {
    return (database.current as TestDatabase).db;
  },
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));

const mockAuth = vi.mocked(auth);

function signInAs(userId: string | null) {
  mockAuth.mockResolvedValue({
    isAuthenticated: userId !== null,
    userId,
  } as Awaited<ReturnType<typeof auth>>);
}

beforeAll(async () => {
  const testDatabase = await createTestDatabase();
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
});
