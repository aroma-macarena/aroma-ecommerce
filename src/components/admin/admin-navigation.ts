import {
  Building2,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Package,
  Tags,
  Users,
} from "lucide-react";

import type { AdminRole } from "@/lib/auth/get-current-profile";

export type AdminNavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: AdminRole[];
  available: boolean;
};

export const adminNavigationItems: AdminNavigationItem[] = [
  {
    href: "/admin",
    label: "Inicio",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "ASSOCIATION_ADMIN"],
    available: true,
  },
  {
    href: "/admin/associations",
    label: "Asociaciones",
    icon: Building2,
    roles: ["SUPER_ADMIN"],
    available: false,
  },
  {
    href: "/admin/categories",
    label: "Categorías",
    icon: Tags,
    roles: ["SUPER_ADMIN"],
    available: false,
  },
  {
    href: "/admin/products",
    label: "Productos",
    icon: Package,
    roles: ["SUPER_ADMIN", "ASSOCIATION_ADMIN"],
    available: false,
  },
  {
    href: "/admin/content",
    label: "Contenido",
    icon: FileText,
    roles: ["SUPER_ADMIN"],
    available: false,
  },
  {
    href: "/admin/users",
    label: "Usuarios",
    icon: Users,
    roles: ["SUPER_ADMIN"],
    available: false,
  },
];

export function getAdminNavigation(role: AdminRole) {
  return adminNavigationItems.filter((item) => item.roles.includes(role));
}

export const adminRoleLabels: Record<AdminRole, string> = {
  SUPER_ADMIN: "Superadministrador",
  ASSOCIATION_ADMIN: "Administrador de asociación",
};
