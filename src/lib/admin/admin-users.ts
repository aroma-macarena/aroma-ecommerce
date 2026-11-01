import { and, asc, eq, isNotNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { associationsTable as associations } from "@/db/schema/associations";
import { profilesTable as profiles } from "@/db/schema/profiles";
import type {
  AdminUserFieldErrors,
  AdminUserInput,
  AdminUserUpdateInput,
} from "@/lib/admin/admin-user-form";
import { isUniqueViolation } from "@/lib/admin/unique-slug";
import { isSuperAdmin } from "@/lib/auth/authorization";
import type { AdminProfile } from "@/lib/auth/get-current-profile";
import {
  createInvitation,
  findUserIdByEmail,
  IdentityProviderError,
  revokeInvitation,
  revokeInvitationQuietly,
} from "@/lib/auth/identity-provider";

export type AdminUserStatus = "ACTIVE" | "INACTIVE";

export type AdminUserResult =
  | { ok: true }
  | { ok: false; reason: "INVALID"; fieldErrors: AdminUserFieldErrors }
  | {
      ok: false;
      reason:
        | "FORBIDDEN"
        | "NOT_FOUND"
        | "SELF"
        | "NOT_PENDING"
        | "CHANGED"
        | "PROVIDER_ERROR";
    };

export type CreateAdminUserResult =
  { ok: true; invited: boolean } | Exclude<AdminUserResult, { ok: true }>;

const EMAIL_INDEX = "uq_profiles_email_lower";

export const DUPLICATE_EMAIL =
  "Ya hay una cuenta administrativa con ese correo.";

const duplicateEmail = {
  ok: false,
  reason: "INVALID",
  fieldErrors: { email: DUPLICATE_EMAIL },
} as const satisfies AdminUserResult;

function isUuid(value: string) {
  return z.uuid().safeParse(value).success;
}

const userColumns = {
  id: profiles.id,
  name: profiles.name,
  email: profiles.email,
  role: profiles.role,
  status: profiles.status,
  associationId: profiles.associationId,
  associationName: associations.name,
  associationStatus: associations.status,
  isPending: sql<boolean>`${profiles.invitationId} is not null`,
};

/**
 * Every administrative account, with its role, association and status.
 * Null for anyone but a super administrator.
 */
export async function getAdminUsers(profile: AdminProfile) {
  if (!isSuperAdmin(profile)) {
    return null;
  }

  return db
    .select(userColumns)
    .from(profiles)
    .leftJoin(associations, eq(profiles.associationId, associations.id))
    .orderBy(asc(sql`lower(${profiles.name})`), asc(profiles.email));
}

export type AdminUser = NonNullable<
  Awaited<ReturnType<typeof getAdminUsers>>
>[number];

/** One account a super administrator may edit; otherwise null. */
export async function getEditableAdminUser(
  profile: AdminProfile,
  userId: string,
) {
  if (!isSuperAdmin(profile) || !isUuid(userId)) {
    return null;
  }

  const [user] = await db
    .select(userColumns)
    .from(profiles)
    .leftJoin(associations, eq(profiles.associationId, associations.id))
    .where(eq(profiles.id, userId))
    .limit(1);

  return user ?? null;
}

/** Associations an administrator can be assigned to, inactive ones too. */
export async function getAssignableAssociations(profile: AdminProfile) {
  if (!isSuperAdmin(profile)) {
    return [];
  }

  return db
    .select({
      id: associations.id,
      name: associations.name,
      status: associations.status,
    })
    .from(associations)
    .orderBy(asc(associations.name));
}

export type AssignableAssociation = Awaited<
  ReturnType<typeof getAssignableAssociations>
>[number];

/**
 * The association column for a role: required and existing for an
 * association administrator, always empty for a super administrator.
 */
async function resolveAssociation(
  input: Pick<AdminUserInput, "role" | "associationId">,
) {
  if (input.role === "SUPER_ADMIN") {
    return { associationId: null };
  }

  if (!input.associationId || !isUuid(input.associationId)) {
    return { error: "Elige la asociación que administrará." };
  }

  const [association] = await db
    .select({ id: associations.id })
    .from(associations)
    .where(eq(associations.id, input.associationId))
    .limit(1);

  return association
    ? { associationId: association.id }
    : { error: "Esa asociación ya no existe. Elige otra." };
}

async function isEmailTaken(email: string) {
  const [duplicate] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(sql`lower(${profiles.email}) = lower(${email})`)
    .limit(1);

  return Boolean(duplicate);
}

/**
 * Gives someone administrative access. If the email already has a Clerk
 * account, the profile is linked to it at once. Otherwise Clerk sends an
 * invitation and the profile waits, with no Clerk user, until the person
 * accepts it and signs in for the first time.
 */
export async function createAdminUser(
  profile: AdminProfile,
  input: AdminUserInput,
): Promise<CreateAdminUserResult> {
  if (!isSuperAdmin(profile)) {
    return { ok: false, reason: "FORBIDDEN" };
  }

  const association = await resolveAssociation(input);

  if ("error" in association) {
    return {
      ok: false,
      reason: "INVALID",
      fieldErrors: { associationId: association.error },
    };
  }

  if (await isEmailTaken(input.email)) {
    return duplicateEmail;
  }

  const values = {
    name: input.name,
    email: input.email,
    role: input.role,
    associationId: association.associationId,
  };

  let existingUserId: string | null;

  try {
    existingUserId = await findUserIdByEmail(input.email);
  } catch (error) {
    if (error instanceof IdentityProviderError) {
      return { ok: false, reason: "PROVIDER_ERROR" };
    }
    throw error;
  }

  if (existingUserId) {
    try {
      await db
        .insert(profiles)
        .values({ ...values, authUserId: existingUserId });
    } catch (error) {
      if (isUniqueViolation(error, EMAIL_INDEX)) {
        return duplicateEmail;
      }
      // The Clerk account already belongs to another profile, under an
      // email that was changed in Clerk afterwards.
      if (isUniqueViolation(error, "profiles_auth_user_id_unique")) {
        return {
          ok: false,
          reason: "INVALID",
          fieldErrors: {
            email:
              "La cuenta de acceso con ese correo ya está enlazada a otro perfil administrativo.",
          },
        };
      }
      throw error;
    }

    return { ok: true, invited: false };
  }

  let invitationId: string;

  try {
    invitationId = await createInvitation(input.email);
  } catch (error) {
    if (error instanceof IdentityProviderError) {
      return { ok: false, reason: "PROVIDER_ERROR" };
    }
    throw error;
  }

  try {
    await db.insert(profiles).values({ ...values, invitationId });
  } catch (error) {
    // No profile, no invitation: the email can be invited again.
    await revokeInvitationQuietly(invitationId);

    if (isUniqueViolation(error, EMAIL_INDEX)) {
      return duplicateEmail;
    }
    throw error;
  }

  return { ok: true, invited: true };
}

/**
 * Changes an administrator's name, role and association. The email stays:
 * it identifies the person's Clerk account. Nobody changes their own role,
 * so the alliance cannot lose its last super administrator by accident.
 */
export async function updateAdminUser(
  profile: AdminProfile,
  userId: string,
  input: AdminUserUpdateInput,
): Promise<AdminUserResult> {
  const user = await getEditableAdminUser(profile, userId);

  if (!user) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  if (user.id === profile.id && input.role !== user.role) {
    return {
      ok: false,
      reason: "INVALID",
      fieldErrors: { role: "No puedes cambiar tu propio rol." },
    };
  }

  const association = await resolveAssociation(input);

  if ("error" in association) {
    return {
      ok: false,
      reason: "INVALID",
      fieldErrors: { associationId: association.error },
    };
  }

  await db
    .update(profiles)
    .set({
      name: input.name,
      role: input.role,
      associationId: association.associationId,
      updatedAt: sql`now()`,
    })
    .where(eq(profiles.id, user.id));

  return { ok: true };
}

/**
 * Turns administrative access on or off. Access is checked on every request,
 * so deactivating takes effect at once; the Clerk account and the authorship
 * of past changes stay. Nobody deactivates their own account.
 */
export async function setAdminUserStatus(
  profile: AdminProfile,
  userId: string,
  status: AdminUserStatus,
): Promise<AdminUserResult> {
  if (!isSuperAdmin(profile)) {
    return { ok: false, reason: "FORBIDDEN" };
  }

  if (!isUuid(userId)) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  if (userId === profile.id) {
    return { ok: false, reason: "SELF" };
  }

  const updated = await db
    .update(profiles)
    .set({ status, updatedAt: sql`now()` })
    .where(eq(profiles.id, userId))
    .returning({ id: profiles.id });

  return updated.length > 0 ? { ok: true } : { ok: false, reason: "NOT_FOUND" };
}

/**
 * Sends a pending invitation again: the previous one is revoked and a new
 * one replaces it, unless the person accepted it meanwhile.
 */
export async function resendInvitation(
  profile: AdminProfile,
  userId: string,
): Promise<AdminUserResult> {
  if (!isSuperAdmin(profile) || !isUuid(userId)) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const [pending] = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      invitationId: profiles.invitationId,
    })
    .from(profiles)
    .where(and(eq(profiles.id, userId), isNotNull(profiles.invitationId)))
    .limit(1);

  if (!pending?.invitationId) {
    return { ok: false, reason: "NOT_PENDING" };
  }

  let invitationId: string;

  try {
    // Clerk keeps one pending invitation per email, and the previous link
    // must stop working before a new one goes out.
    await revokeInvitation(pending.invitationId);
    invitationId = await createInvitation(pending.email);
  } catch (error) {
    if (error instanceof IdentityProviderError) {
      return { ok: false, reason: "PROVIDER_ERROR" };
    }
    throw error;
  }

  const updated = await db
    .update(profiles)
    .set({ invitationId, updatedAt: sql`now()` })
    .where(
      and(
        eq(profiles.id, pending.id),
        eq(profiles.invitationId, pending.invitationId),
      ),
    )
    .returning({ id: profiles.id });

  if (updated.length === 0) {
    await revokeInvitationQuietly(invitationId);
    return { ok: false, reason: "NOT_PENDING" };
  }

  return { ok: true };
}

/**
 * Withdraws a pending invitation and deletes its profile, which has no
 * account and no history yet. Accepted invitations cannot be cancelled;
 * those accounts are deactivated instead.
 */
export async function cancelInvitation(
  profile: AdminProfile,
  userId: string,
): Promise<AdminUserResult> {
  if (!isSuperAdmin(profile) || !isUuid(userId)) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const [pending] = await db
    .select({ invitationId: profiles.invitationId })
    .from(profiles)
    .where(and(eq(profiles.id, userId), isNotNull(profiles.invitationId)))
    .limit(1);

  if (!pending?.invitationId) {
    return { ok: false, reason: "NOT_PENDING" };
  }

  // Revoked first: if Clerk fails, the profile stays pending and keeps the
  // invitation id, so cancelling can be retried.
  try {
    await revokeInvitation(pending.invitationId);
  } catch (error) {
    if (error instanceof IdentityProviderError) {
      return { ok: false, reason: "PROVIDER_ERROR" };
    }
    throw error;
  }

  // Only the invitation that was revoked: if it was resent meanwhile, the
  // profile now holds a live one and stays.
  const deleted = await db
    .delete(profiles)
    .where(
      and(
        eq(profiles.id, userId),
        eq(profiles.invitationId, pending.invitationId),
      ),
    )
    .returning({ id: profiles.id });

  if (deleted.length > 0) {
    return { ok: true };
  }

  const [current] = await db
    .select({ invitationId: profiles.invitationId })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return {
    ok: false,
    reason: current?.invitationId ? "CHANGED" : "NOT_PENDING",
  };
}
