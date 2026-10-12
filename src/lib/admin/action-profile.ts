import { redirect } from "next/navigation";

import getCurrentProfile from "@/lib/auth/get-current-profile";

/**
 * The active profile for a Server Action, which is a public endpoint and
 * checks access again; null when the account lost access meanwhile.
 */
export async function getActionProfile() {
  const result = await getCurrentProfile();

  if (result.status === "UNAUTHENTICATED") {
    redirect("/admin/sign-in");
  }

  return result.status === "ACTIVE" ? result.currentProfile : null;
}
