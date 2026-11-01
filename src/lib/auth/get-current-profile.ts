import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { associationsTable as associations } from "@/db/schema/associations";
import { profilesTable as profiles } from "@/db/schema/profiles";
import { isUniqueViolation } from "@/lib/admin/unique-slug";
import { getVerifiedEmails } from "@/lib/auth/identity-provider";

export type AdminProfile = { id: string; name: string; email: string } & (
  | { role: "SUPER_ADMIN"; associationId: null; associationName: null }
  | {
      role: "ASSOCIATION_ADMIN";
      associationId: string;
      associationName: string;
    }
);

export type AdminRole = AdminProfile["role"];

/** Who is blocked, so access notices can show it. */
export type InactiveAccount = {
  email: string;
  associationName: string | null;
};

export type CurrentProfileResult =
  | { status: "UNAUTHENTICATED" }
  | { status: "PROFILE_NOT_FOUND" }
  | { status: "INACTIVE"; account: InactiveAccount }
  | { status: "ASSOCIATION_INACTIVE"; account: InactiveAccount }
  | { status: "ACTIVE"; currentProfile: AdminProfile };

async function findProfile(userId: string) {
  const [profile] = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      email: profiles.email,
      associationId: profiles.associationId,
      role: profiles.role,
      status: profiles.status,
      associationName: associations.name,
      associationStatus: associations.status,
    })
    .from(profiles)
    .leftJoin(associations, eq(profiles.associationId, associations.id))
    .where(eq(profiles.authUserId, userId))
    .limit(1);

  return profile;
}

/**
 * Links a signed-in Clerk user to the invited profile with one of their
 * verified emails. Runs once, the first time someone who accepted an
 * invitation (or already had a Clerk account) reaches the panel; the update
 * only takes a profile no one has claimed, so two sessions cannot share it.
 */
async function claimInvitedProfile(userId: string) {
  let emails: string[];

  try {
    emails = await getVerifiedEmails(userId);
  } catch {
    // Without Clerk the link waits for the next request.
    return false;
  }

  if (emails.length === 0) {
    return false;
  }

  let claimed: { id: string }[];

  try {
    claimed = await db
      .update(profiles)
      .set({ authUserId: userId, invitationId: null, updatedAt: sql`now()` })
      .where(
        // One profile at most, even if several of the user's emails were
        // invited: a Clerk user maps to a single AROMA profile.
        and(
          isNull(profiles.authUserId),
          eq(
            profiles.id,
            db
              .select({ id: profiles.id })
              .from(profiles)
              .where(
                and(
                  isNull(profiles.authUserId),
                  inArray(sql`lower(${profiles.email})`, emails),
                ),
              )
              .orderBy(profiles.createdAt)
              .limit(1),
          ),
        ),
      )
      .returning({ id: profiles.id });
  } catch (error) {
    // A parallel request of the same user claimed a profile first.
    if (isUniqueViolation(error, "profiles_auth_user_id_unique")) {
      return true;
    }
    throw error;
  }

  return claimed.length > 0;
}

const getCurrentProfile = cache(async (): Promise<CurrentProfileResult> => {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return { status: "UNAUTHENTICATED" };
  }

  const currentProfile =
    (await findProfile(userId)) ??
    ((await claimInvitedProfile(userId)) ? await findProfile(userId) : null);

  if (!currentProfile) {
    return { status: "PROFILE_NOT_FOUND" };
  }

  if (currentProfile.status !== "ACTIVE") {
    return {
      status: "INACTIVE",
      account: {
        email: currentProfile.email,
        associationName: currentProfile.associationName,
      },
    };
  }

  if (currentProfile.role === "SUPER_ADMIN") {
    return {
      status: "ACTIVE",
      currentProfile: {
        id: currentProfile.id,
        name: currentProfile.name,
        email: currentProfile.email,
        role: "SUPER_ADMIN",
        associationId: null,
        associationName: null,
      },
    };
  }

  if (!currentProfile.associationId || !currentProfile.associationName) {
    return {
      status: "INACTIVE",
      account: {
        email: currentProfile.email,
        associationName: currentProfile.associationName,
      },
    };
  }

  if (currentProfile.associationStatus !== "ACTIVE") {
    return {
      status: "ASSOCIATION_INACTIVE",
      account: {
        email: currentProfile.email,
        associationName: currentProfile.associationName,
      },
    };
  }

  return {
    status: "ACTIVE",
    currentProfile: {
      id: currentProfile.id,
      name: currentProfile.name,
      email: currentProfile.email,
      role: "ASSOCIATION_ADMIN",
      associationId: currentProfile.associationId,
      associationName: currentProfile.associationName,
    },
  };
});

export default getCurrentProfile;
