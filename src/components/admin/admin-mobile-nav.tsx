"use client";

import { Menu } from "lucide-react";
import { type ReactNode, useState } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { AromaLogo } from "@/components/brand/aroma-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AdminRole } from "@/lib/auth/get-current-profile";

type AdminMobileNavProps = {
  role: AdminRole;
  footer: ReactNode;
};

function AdminMobileNav({ role, footer }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Abrir menú" />}
      >
        <Menu />
      </SheetTrigger>

      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <AromaLogo className="w-36" sizes="144px" />
          <SheetTitle className="sr-only">Menú de administración</SheetTitle>
          <SheetDescription className="sr-only">
            Navegación del panel administrativo de AROMA.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <AdminNav role={role} onNavigate={() => setOpen(false)} />
        </div>

        <SheetFooter>{footer}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { AdminMobileNav };
