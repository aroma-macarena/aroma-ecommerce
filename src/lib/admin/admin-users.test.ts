import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { profilesTable } from "@/db/schema/profiles";
import {
  parseAdminUser,
  parseAdminUserUpdate,
} from "@/lib/admin/admin-user-form";
import {
  cancelInvitation,
  createAdminUser,
  getAdminUsers,
  resendInvitation,
  setAdminUserStatus,
  updateAdminUser,
} from "@/lib/admin/admin-users";
import {
  createInvitation,
  findUserIdByEmail,
  IdentityProviderError,
  revokeInvitation,
  revokeInvitationQuietly,
} from "@/lib/auth/identity-provider";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import {
  bosqueVivoAdmin,
  ids,
  seedAdminProfiles,
  seedCatalog,
  superAdmin,
} from "@/test/fixtures";

const database = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@/db", () => ({
  get db() {
    return (database.current as TestDatabase).db;
  },
}));

vi.mock("@/lib/auth/identity-provider", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/auth/identity-provider")>();
  let invitations = 0;

  return {
    IdentityProviderError: actual.IdentityProviderError,
    findUserIdByEmail: vi.fn(async () => null),
    createInvitation: vi.fn(async () => `inv_${++invitations}`),
    revokeInvitation: vi.fn(async () => undefined),
    revokeInvitationQuietly: vi.fn(async () => undefined),
    getVerifiedEmails: vi.fn(async () => []),
  };
});

const mockFindUser = vi.mocked(findUserIdByEmail);
const mockCreateInvitation = vi.mocked(createInvitation);
const mockRevokeInvitation = vi.mocked(revokeInvitation);
const mockRevokeQuietly = vi.mocked(revokeInvitationQuietly);

const { bosqueVivo, sabores } = ids.associations;

function testDatabase() {
  return database.current as TestDatabase;
}

async function stored(email: string) {
  const [profile] = await testDatabase()
    .db.select()
    .from(profilesTable)
    .where(eq(profilesTable.email, email));
  return profile;
}

function newUser(overrides: Record<string, string> = {}) {
  const parsed = parseAdminUser({
    name: "Lucía Rojas",
    email: "lucia@aroma.test",
    role: "ASSOCIATION_ADMIN",
    associationId: bosqueVivo,
    ...overrides,
  });

  if (!parsed.success) {
    throw new Error(JSON.stringify(parsed.fieldErrors));
  }

  return parsed.data;
}

function changes(overrides: Record<string, string> = {}) {
  const parsed = parseAdminUserUpdate({
    name: "Admin Bosque Vivo",
    role: "ASSOCIATION_ADMIN",
    associationId: bosqueVivo,
    ...overrides,
  });

  if (!parsed.success) {
    throw new Error(JSON.stringify(parsed.fieldErrors));
  }

  return parsed.data;
}

beforeAll(async () => {
  const created = await createTestDatabase();
  database.current = created;
  await seedCatalog(created);
  await seedAdminProfiles(created);
});

beforeEach(async () => {
  await testDatabase()
    .db.delete(profilesTable)
    .where(eq(profilesTable.email, "lucia@aroma.test"));
  await testDatabase()
    .db.update(profilesTable)
    .set({
      name: bosqueVivoAdmin.name,
      role: "ASSOCIATION_ADMIN",
      associationId: bosqueVivo,
      status: "ACTIVE",
    })
    .where(eq(profilesTable.id, bosqueVivoAdmin.id));
});

describe("parseAdminUser", () => {
  it("requires an association for association administrators", () => {
    expect(
      parseAdminUser({
        name: "Lucía",
        email: "lucia@aroma.test",
        role: "ASSOCIATION_ADMIN",
      }),
    ).toMatchObject({
      success: false,
      fieldErrors: { associationId: expect.any(String) },
    });
  });

  it("rejects an invalid email and lowercases a valid one", () => {
    expect(
      parseAdminUser({ name: "Lucía", email: "lucía", role: "SUPER_ADMIN" }),
    ).toMatchObject({
      success: false,
      fieldErrors: { email: expect.any(String) },
    });
    expect(
      parseAdminUser({
        name: "Lucía",
        email: " Lucia@AROMA.test ",
        role: "SUPER_ADMIN",
      }),
    ).toMatchObject({ success: true, data: { email: "lucia@aroma.test" } });
  });
});

describe("getAdminUsers", () => {
  it("lists every account for a super administrator only", async () => {
    await expect(getAdminUsers(bosqueVivoAdmin)).resolves.toBeNull();

    const users = await getAdminUsers(superAdmin);
    expect(users).toContainEqual(
      expect.objectContaining({
        email: bosqueVivoAdmin.email,
        role: "ASSOCIATION_ADMIN",
        associationName: "Asociación Bosque Vivo",
        status: "ACTIVE",
        isPending: false,
      }),
    );
  });
});

describe("createAdminUser", () => {
  it("invites a new email and keeps the profile pending, without a Clerk user", async () => {
    await expect(createAdminUser(superAdmin, newUser())).resolves.toEqual({
      ok: true,
      invited: true,
    });

    expect(mockCreateInvitation).toHaveBeenCalledWith("lucia@aroma.test");
    expect(await stored("lucia@aroma.test")).toMatchObject({
      authUserId: null,
      invitationId: expect.stringMatching(/^inv_/),
      role: "ASSOCIATION_ADMIN",
      associationId: bosqueVivo,
      status: "ACTIVE",
    });
  });

  it("links an email that already has a Clerk account, without inviting", async () => {
    mockFindUser.mockResolvedValueOnce("user_lucia");

    await expect(createAdminUser(superAdmin, newUser())).resolves.toEqual({
      ok: true,
      invited: false,
    });

    expect(mockCreateInvitation).not.toHaveBeenCalled();
    expect(await stored("lucia@aroma.test")).toMatchObject({
      authUserId: "user_lucia",
      invitationId: null,
    });
  });

  it("rejects an email another profile uses, ignoring case", async () => {
    await expect(
      createAdminUser(superAdmin, newUser({ email: "BOSQUE@aroma.test" })),
    ).resolves.toMatchObject({
      ok: false,
      reason: "INVALID",
      fieldErrors: { email: expect.any(String) },
    });
    expect(mockCreateInvitation).not.toHaveBeenCalled();
  });

  it("rejects a Clerk account that is already linked to another profile", async () => {
    mockFindUser.mockResolvedValueOnce(`user_${bosqueVivoAdmin.id}`);

    await expect(createAdminUser(superAdmin, newUser())).resolves.toMatchObject(
      {
        ok: false,
        reason: "INVALID",
        fieldErrors: { email: expect.any(String) },
      },
    );
    expect(await stored("lucia@aroma.test")).toBeUndefined();
  });

  it("saves nothing when Clerk cannot send the invitation", async () => {
    mockCreateInvitation.mockRejectedValueOnce(
      new IdentityProviderError("No pudimos enviar la invitación."),
    );

    await expect(createAdminUser(superAdmin, newUser())).resolves.toEqual({
      ok: false,
      reason: "PROVIDER_ERROR",
    });
    expect(await stored("lucia@aroma.test")).toBeUndefined();
  });

  it("revokes the invitation when the profile cannot be saved", async () => {
    // Another request saves the same email while Clerk sends the invitation.
    mockCreateInvitation.mockImplementationOnce(async () => {
      await testDatabase().db.insert(profilesTable).values({
        authUserId: "user_lucia",
        name: "Lucía",
        email: "LUCIA@aroma.test",
        role: "SUPER_ADMIN",
      });
      return "inv_race";
    });

    await expect(createAdminUser(superAdmin, newUser())).resolves.toMatchObject(
      { ok: false, reason: "INVALID" },
    );
    expect(mockRevokeQuietly).toHaveBeenCalledWith("inv_race");
    await testDatabase()
      .db.delete(profilesTable)
      .where(eq(profilesTable.email, "LUCIA@aroma.test"));
  });

  it("never scopes a super administrator to an association", async () => {
    await createAdminUser(
      superAdmin,
      newUser({ role: "SUPER_ADMIN", associationId: sabores }),
    );

    expect((await stored("lucia@aroma.test")).associationId).toBeNull();
  });

  it("is only for super administrators", async () => {
    await expect(createAdminUser(bosqueVivoAdmin, newUser())).resolves.toEqual({
      ok: false,
      reason: "FORBIDDEN",
    });
  });
});

describe("updateAdminUser", () => {
  it("moves an administrator to another association", async () => {
    await expect(
      updateAdminUser(
        superAdmin,
        bosqueVivoAdmin.id,
        changes({ associationId: sabores }),
      ),
    ).resolves.toEqual({ ok: true });
    expect((await stored(bosqueVivoAdmin.email)).associationId).toBe(sabores);
  });

  it("clears the association when promoting to super administrator", async () => {
    await updateAdminUser(
      superAdmin,
      bosqueVivoAdmin.id,
      changes({ role: "SUPER_ADMIN" }),
    );

    expect(await stored(bosqueVivoAdmin.email)).toMatchObject({
      role: "SUPER_ADMIN",
      associationId: null,
    });
  });

  it("rejects an association that does not exist", async () => {
    await expect(
      updateAdminUser(
        superAdmin,
        bosqueVivoAdmin.id,
        changes({ associationId: "00000000-0000-4000-8000-00000000ffff" }),
      ),
    ).resolves.toMatchObject({
      ok: false,
      fieldErrors: { associationId: expect.any(String) },
    });
  });

  it("does not let super administrators change their own role", async () => {
    await expect(
      updateAdminUser(
        superAdmin,
        superAdmin.id,
        changes({ name: superAdmin.name }),
      ),
    ).resolves.toMatchObject({
      ok: false,
      fieldErrors: { role: expect.any(String) },
    });
  });

  it("is only for super administrators", async () => {
    await expect(
      updateAdminUser(bosqueVivoAdmin, bosqueVivoAdmin.id, changes()),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
  });
});

describe("setAdminUserStatus", () => {
  it("deactivates and reactivates an administrator", async () => {
    await expect(
      setAdminUserStatus(superAdmin, bosqueVivoAdmin.id, "INACTIVE"),
    ).resolves.toEqual({ ok: true });
    expect((await stored(bosqueVivoAdmin.email)).status).toBe("INACTIVE");

    await setAdminUserStatus(superAdmin, bosqueVivoAdmin.id, "ACTIVE");
    expect((await stored(bosqueVivoAdmin.email)).status).toBe("ACTIVE");
  });

  it("keeps the Clerk link when deactivating", async () => {
    await setAdminUserStatus(superAdmin, bosqueVivoAdmin.id, "INACTIVE");

    expect((await stored(bosqueVivoAdmin.email)).authUserId).toBe(
      `user_${bosqueVivoAdmin.id}`,
    );
  });

  it("does not let anyone deactivate their own account", async () => {
    await expect(
      setAdminUserStatus(superAdmin, superAdmin.id, "INACTIVE"),
    ).resolves.toEqual({ ok: false, reason: "SELF" });
  });

  it("is only for super administrators", async () => {
    await expect(
      setAdminUserStatus(bosqueVivoAdmin, superAdmin.id, "INACTIVE"),
    ).resolves.toEqual({ ok: false, reason: "FORBIDDEN" });
  });
});

describe("pending invitations", () => {
  async function invite() {
    await createAdminUser(superAdmin, newUser());
    return stored("lucia@aroma.test");
  }

  it("resends by revoking the previous invitation", async () => {
    const pending = await invite();

    await expect(resendInvitation(superAdmin, pending.id)).resolves.toEqual({
      ok: true,
    });

    expect(mockRevokeInvitation).toHaveBeenCalledWith(pending.invitationId);
    const updated = await stored("lucia@aroma.test");
    expect(updated.invitationId).not.toBe(pending.invitationId);
    expect(updated.authUserId).toBeNull();
  });

  it("cancels by revoking the invitation and deleting the profile", async () => {
    const pending = await invite();

    await expect(cancelInvitation(superAdmin, pending.id)).resolves.toEqual({
      ok: true,
    });

    expect(mockRevokeInvitation).toHaveBeenCalledWith(pending.invitationId);
    expect(await stored("lucia@aroma.test")).toBeUndefined();
  });

  it("keeps the pending profile when Clerk cannot revoke on cancel", async () => {
    const pending = await invite();
    mockRevokeInvitation.mockRejectedValueOnce(
      new IdentityProviderError("No pudimos anular la invitación."),
    );

    await expect(cancelInvitation(superAdmin, pending.id)).resolves.toEqual({
      ok: false,
      reason: "PROVIDER_ERROR",
    });
    expect(await stored("lucia@aroma.test")).toMatchObject({
      invitationId: pending.invitationId,
    });
  });

  it("sends no new invitation when Clerk cannot revoke the previous one", async () => {
    const pending = await invite();
    mockCreateInvitation.mockClear();
    mockRevokeInvitation.mockRejectedValueOnce(
      new IdentityProviderError("No pudimos anular la invitación."),
    );

    await expect(resendInvitation(superAdmin, pending.id)).resolves.toEqual({
      ok: false,
      reason: "PROVIDER_ERROR",
    });
    expect(mockCreateInvitation).not.toHaveBeenCalled();
    expect((await stored("lucia@aroma.test")).invitationId).toBe(
      pending.invitationId,
    );
  });

  it("does not resend or cancel for an account that is already linked", async () => {
    await expect(
      resendInvitation(superAdmin, bosqueVivoAdmin.id),
    ).resolves.toEqual({ ok: false, reason: "NOT_PENDING" });
    await expect(
      cancelInvitation(superAdmin, bosqueVivoAdmin.id),
    ).resolves.toEqual({ ok: false, reason: "NOT_PENDING" });
    expect(await stored(bosqueVivoAdmin.email)).toBeDefined();
  });
});

describe("profile invariants", () => {
  it("rejects a profile that is neither linked nor invited", async () => {
    await expect(
      testDatabase().db.insert(profilesTable).values({
        name: "Sin cuenta",
        email: "lucia@aroma.test",
        role: "SUPER_ADMIN",
      }),
    ).rejects.toThrow();
  });

  it("rejects a super administrator with an association", async () => {
    await expect(
      testDatabase().db.insert(profilesTable).values({
        authUserId: "user_lucia",
        name: "Lucía",
        email: "lucia@aroma.test",
        role: "SUPER_ADMIN",
        associationId: bosqueVivo,
      }),
    ).rejects.toThrow();
  });
});
