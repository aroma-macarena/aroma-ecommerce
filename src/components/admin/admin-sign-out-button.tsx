"use client";

import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminSignOutButtonProps = {
  label?: string;
};

function AdminSignOutButton({
  label = "Cerrar sesión",
}: AdminSignOutButtonProps) {
  return (
    <SignOutButton redirectUrl="/admin/sign-in">
      <Button variant="outline" className="w-full">
        <LogOut data-icon="inline-start" />
        {label}
      </Button>
    </SignOutButton>
  );
}

export { AdminSignOutButton };
