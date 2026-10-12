import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function AdminBackLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground -ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <ArrowLeft aria-hidden className="size-4" />
      {children}
    </Link>
  );
}

export { AdminBackLink };
