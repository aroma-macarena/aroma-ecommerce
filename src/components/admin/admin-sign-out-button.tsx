"use client";

import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

function AdminSignOutButton() {
  return (
    <SignOutButton redirectUrl="/admin/sign-in">
      <Button variant="outline" className="w-full">
        <LogOut data-icon="inline-start" />
        Cerrar sesión
      </Button>
    </SignOutButton>
  );
}

export { AdminSignOutButton };
