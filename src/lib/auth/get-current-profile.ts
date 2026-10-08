import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { associationsTable as associations } from "@/db/schema/associations";
import { profilesTable as profiles } from "@/db/schema/profiles";

export type AdminProfile =
  | { id: string; role: "SUPER_ADMIN"; associationId: null }
  | { id: string; role: "ASSOCIATION_ADMIN"; associationId: string };

export type AdminRole = AdminProfile["role"];

export type CurrentProfileResult =
  | { status: "UNAUTHENTICATED" }
  | { status: "PROFILE_NOT_FOUND" }
  | { status: "INACTIVE" }
  | { status: "ASSOCIATION_INACTIVE" }
  | { status: "ACTIVE"; currentProfile: AdminProfile };

const getCurrentProfile = cache(async (): Promise<CurrentProfileResult> => {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return { status: "UNAUTHENTICATED" };
  }

  const [currentProfile] = await db
    .select({
      id: profiles.id,
      associationId: profiles.associationId,
      role: profiles.role,
      status: profiles.status,
      associationStatus: associations.status,
    })
    .from(profiles)
    .leftJoin(associations, eq(profiles.associationId, associations.id))
    .where(eq(profiles.authUserId, userId))
    .limit(1);

  if (!currentProfile) {
    return { status: "PROFILE_NOT_FOUND" };
  }

  if (currentProfile.status !== "ACTIVE") {
    return { status: "INACTIVE" };
  }

  if (currentProfile.role === "SUPER_ADMIN") {
    return {
      status: "ACTIVE",
      currentProfile: {
        id: currentProfile.id,
        role: "SUPER_ADMIN",
        associationId: null,
      },
    };
  }

  if (!currentProfile.associationId) {
    return { status: "INACTIVE" };
  }

  if (currentProfile.associationStatus !== "ACTIVE") {
    return { status: "ASSOCIATION_INACTIVE" };
  }

  return {
    status: "ACTIVE",
    currentProfile: {
      id: currentProfile.id,
      role: "ASSOCIATION_ADMIN",
      associationId: currentProfile.associationId,
    },
  };
});

export default getCurrentProfile;
