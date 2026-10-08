import { adminRoleLabels } from "@/components/admin/admin-navigation";
import type { AdminProfile } from "@/lib/auth/get-current-profile";

type AdminIdentityProps = {
  profile: AdminProfile;
};

function AdminIdentity({ profile }: AdminIdentityProps) {
  return (
    <div className="bg-muted space-y-1 rounded-2xl p-3 text-sm">
      <p className="truncate font-medium">{profile.name}</p>
      <p className="text-muted-foreground truncate">{profile.email}</p>
      <p className="text-primary text-xs font-medium">
        {adminRoleLabels[profile.role]}
      </p>
      {profile.associationName ? (
        <p className="text-muted-foreground truncate text-xs">
          {profile.associationName}
        </p>
      ) : null}
    </div>
  );
}

export { AdminIdentity };
