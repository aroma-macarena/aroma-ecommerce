import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </>
  );
}
