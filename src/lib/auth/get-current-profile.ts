import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { associationsTable as associations } from "@/db/schema/associations";
import { profilesTable as profiles } from "@/db/schema/profiles";

export type AdminProfile = { id: string; name: string; email: string } & (
  | { role: "SUPER_ADMIN"; associationId: null; associationName: null }
  | {
      role: "ASSOCIATION_ADMIN";
      associationId: string;
      associationName: string;
    }
);

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
        name: currentProfile.name,
        email: currentProfile.email,
        role: "SUPER_ADMIN",
        associationId: null,
        associationName: null,
      },
    };
  }

  if (!currentProfile.associationId || !currentProfile.associationName) {
    return { status: "INACTIVE" };
  }

  if (currentProfile.associationStatus !== "ACTIVE") {
    return { status: "ASSOCIATION_INACTIVE" };
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
