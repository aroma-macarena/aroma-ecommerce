import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profilesTable as profiles } from "@/db/schema/profiles";

async function getCurrentProfile() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return { status: "UNAUTHENTICATED" } as const;
  }

  const [currentProfile] = await db
    .select({
      id: profiles.id,
      associationId: profiles.associationId,
      role: profiles.role,
      status: profiles.status,
    })
    .from(profiles)
    .where(eq(profiles.authUserId, userId))
    .limit(1);

  if (!currentProfile) {
    return { status: "PROFILE_NOT_FOUND" } as const;
  }

  if (currentProfile.status !== "ACTIVE") {
    return { status: "INACTIVE" } as const;
  }

  return {
    status: "ACTIVE",
    currentProfile,
  } as const;
}

export default getCurrentProfile;
