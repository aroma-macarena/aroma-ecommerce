import { adminRoleLabels } from "@/components/admin/admin-navigation";
import type { AdminProfile } from "@/lib/auth/get-current-profile";

type AdminIdentityProps = {
  profile: AdminProfile;
};

function AdminIdentity({ profile }: AdminIdentityProps) {
  return (
    <div className="space-y-0.5 border-t pt-4 text-sm wrap-anywhere">
      <p className="font-bold">{profile.name}</p>
      <p className="text-muted-foreground">
        {profile.associationName ?? adminRoleLabels[profile.role]}
      </p>
    </div>
  );
}

export { AdminIdentity };
