import { adminRoleLabels } from "@/components/admin/admin-navigation";
import type { AdminProfile } from "@/lib/auth/get-current-profile";

type AdminIdentityProps = {
  profile: AdminProfile;
};

function AdminIdentity({ profile }: AdminIdentityProps) {
  return (
    <div className="space-y-1 border-t pt-4 text-sm wrap-anywhere">
      <p className="font-medium">{profile.name}</p>
      <p className="text-muted-foreground">{profile.email}</p>
      <p className="text-primary text-xs font-medium">
        {adminRoleLabels[profile.role]}
      </p>
      {profile.associationName ? (
        <p className="text-muted-foreground text-xs">
          {profile.associationName}
        </p>
      ) : null}
    </div>
  );
}

export { AdminIdentity };
