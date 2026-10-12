"use client";

import { Menu, X } from "lucide-react";
import { type ReactNode, useState } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { AromaLogo } from "@/components/brand/aroma-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
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

      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[calc(100%-1rem)]! max-w-sm overflow-y-auto overscroll-contain"
      >
        <SheetHeader className="shrink-0 p-4">
          <div className="flex items-center justify-between gap-4">
            <AromaLogo className="min-w-0 w-36" />
            <SheetClose render={<Button variant="secondary" size="icon" />}>
              <X aria-hidden="true" />
              <span className="sr-only">Cerrar menú</span>
            </SheetClose>
          </div>
          <SheetTitle className="sr-only">Menú de administración</SheetTitle>
          <SheetDescription className="sr-only">
            Navegación del panel administrativo de AROMA.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <AdminNav role={role} onNavigate={() => setOpen(false)} />
        </div>

        <SheetFooter className="shrink-0 p-4 pt-8">{footer}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { AdminMobileNav };
