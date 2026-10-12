import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AuthorizationError,
  canManageAssociation,
  isAssociationAdmin,
  isSuperAdmin,
  requireAdminProfile,
  requireAssociationAccess,
  requireRole,
} from "@/lib/auth/authorization";
import getCurrentProfile, {
  type CurrentProfileResult,
} from "@/lib/auth/get-current-profile";
import { bosqueVivoAdmin, ids, superAdmin } from "@/test/fixtures";

vi.mock("@/lib/auth/get-current-profile", () => ({ default: vi.fn() }));

const mockCurrentProfile = vi.mocked(getCurrentProfile);

function signInAs(result: CurrentProfileResult) {
  mockCurrentProfile.mockResolvedValue(result);
}

const pausedAccount = {
  email: "bosque@aroma.test",
  associationName: "Asociación Bosque Vivo",
};

describe("role helpers", () => {
  it("identify super administrators", () => {
    expect(isSuperAdmin(superAdmin)).toBe(true);
    expect(isAssociationAdmin(superAdmin)).toBe(false);
  });

  it("identify association administrators", () => {
    expect(isSuperAdmin(bosqueVivoAdmin)).toBe(false);
    expect(isAssociationAdmin(bosqueVivoAdmin)).toBe(true);
  });
});

describe("canManageAssociation", () => {
  it("lets super administrators manage any association", () => {
    expect(canManageAssociation(superAdmin, ids.associations.bosqueVivo)).toBe(
      true,
    );
    expect(canManageAssociation(superAdmin, ids.associations.sabores)).toBe(
      true,
    );
  });

  it("lets association administrators manage only their association", () => {
    expect(
      canManageAssociation(bosqueVivoAdmin, ids.associations.bosqueVivo),
    ).toBe(true);
    expect(
      canManageAssociation(bosqueVivoAdmin, ids.associations.sabores),
    ).toBe(false);
  });
});

describe("requireAdminProfile", () => {
  beforeEach(() => {
    mockCurrentProfile.mockReset();
  });

  it("returns the profile of an active administrator", async () => {
    signInAs({ status: "ACTIVE", currentProfile: bosqueVivoAdmin });

    await expect(requireAdminProfile()).resolves.toEqual(bosqueVivoAdmin);
  });

  it.each([
    ["UNAUTHENTICATED", { status: "UNAUTHENTICATED" }],
    ["PROFILE_NOT_FOUND", { status: "PROFILE_NOT_FOUND" }],
    ["INACTIVE", { status: "INACTIVE", account: pausedAccount }],
    [
      "ASSOCIATION_INACTIVE",
      { status: "ASSOCIATION_INACTIVE", account: pausedAccount },
    ],
  ] satisfies [string, CurrentProfileResult][])(
    "rejects a %s session",
    async (code, result) => {
      signInAs(result);

      await expect(requireAdminProfile()).rejects.toMatchObject({
        name: "AuthorizationError",
        code,
      });
    },
  );
});

describe("requireRole", () => {
  it("allows a role in the list", async () => {
    signInAs({ status: "ACTIVE", currentProfile: superAdmin });

    await expect(requireRole("SUPER_ADMIN")).resolves.toEqual(superAdmin);
  });

  it("allows any of several roles", async () => {
    signInAs({ status: "ACTIVE", currentProfile: bosqueVivoAdmin });

    await expect(
      requireRole("SUPER_ADMIN", "ASSOCIATION_ADMIN"),
    ).resolves.toEqual(bosqueVivoAdmin);
  });

  it("denies a role outside the list", async () => {
    signInAs({ status: "ACTIVE", currentProfile: bosqueVivoAdmin });

    await expect(requireRole("SUPER_ADMIN")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("denies an inactive session before checking the role", async () => {
    signInAs({ status: "INACTIVE", account: pausedAccount });

    await expect(requireRole("ASSOCIATION_ADMIN")).rejects.toMatchObject({
      code: "INACTIVE",
    });
  });
});

describe("requireAssociationAccess", () => {
  it("allows association administrators on their association", async () => {
    signInAs({ status: "ACTIVE", currentProfile: bosqueVivoAdmin });

    await expect(
      requireAssociationAccess(ids.associations.bosqueVivo),
    ).resolves.toEqual(bosqueVivoAdmin);
  });

  it("denies association administrators on another association", async () => {
    signInAs({ status: "ACTIVE", currentProfile: bosqueVivoAdmin });

    const result = requireAssociationAccess(ids.associations.sabores);

    await expect(result).rejects.toBeInstanceOf(AuthorizationError);
    await expect(result).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows super administrators on any association", async () => {
    signInAs({ status: "ACTIVE", currentProfile: superAdmin });

    await expect(
      requireAssociationAccess(ids.associations.sabores),
    ).resolves.toEqual(superAdmin);
  });
});
