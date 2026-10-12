import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { AromaLogo } from "@/components/brand/aroma-logo";

type AdminAccessNoticeProps = {
  title: string;
  description: string;
};

function AdminAccessNotice({ title, description }: AdminAccessNoticeProps) {
  return (
    <main className="bg-background flex min-h-svh flex-1 items-center justify-center px-5 py-12">
      <div className="bg-card w-full max-w-md space-y-6 rounded-lg border p-6">
        <AromaLogo variant="symbol" className="w-14" />
        <div className="space-y-2">
          <h1 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em]">
            {title}
          </h1>
          <p className="text-muted-foreground leading-7">{description}</p>
        </div>
        <AdminSignOutButton />
      </div>
    </main>
  );
}

export { AdminAccessNotice };
