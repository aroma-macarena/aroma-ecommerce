import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { AdminShell } from "@/components/admin/admin-shell";
import getCurrentProfile from "@/lib/auth/get-current-profile";

export const metadata: Metadata = {
  title: {
    default: "Administración",
    template: "%s | Administración AROMA",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getCurrentProfile();

  switch (result.status) {
    case "UNAUTHENTICATED":
      redirect("/admin/sign-in");

    case "PROFILE_NOT_FOUND": {
      const user = await currentUser();
      return (
        <AdminAccessNotice
          reason="PROFILE_NOT_FOUND"
          email={user?.primaryEmailAddress?.emailAddress}
        />
      );
    }

    case "INACTIVE":
    case "ASSOCIATION_INACTIVE":
      return (
        <AdminAccessNotice
          reason={result.status}
          email={result.account.email}
          associationName={result.account.associationName}
        />
      );

    case "ACTIVE":
      return (
        <AdminShell profile={result.currentProfile}>{children}</AdminShell>
      );
  }
}
