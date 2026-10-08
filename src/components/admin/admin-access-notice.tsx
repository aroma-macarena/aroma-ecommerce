import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { AromaLogo } from "@/components/brand/aroma-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AdminAccessNoticeProps = {
  title: string;
  description: string;
};

function AdminAccessNotice({ title, description }: AdminAccessNoticeProps) {
  return (
    <main className="bg-muted/40 flex min-h-svh flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <AromaLogo className="w-36" sizes="144px" />
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminSignOutButton />
        </CardContent>
      </Card>
    </main>
  );
}

export { AdminAccessNotice };
