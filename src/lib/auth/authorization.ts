import getCurrentProfile, {
  type AdminProfile,
  type AdminRole,
} from "@/lib/auth/get-current-profile";

export type AuthorizationErrorCode =
  | "UNAUTHENTICATED"
  | "PROFILE_NOT_FOUND"
  | "INACTIVE"
  | "ASSOCIATION_INACTIVE"
  | "FORBIDDEN";

const authorizationErrorMessages: Record<AuthorizationErrorCode, string> = {
  UNAUTHENTICATED: "Debes iniciar sesión para continuar.",
  PROFILE_NOT_FOUND: "Tu cuenta no tiene un perfil administrativo asociado.",
  INACTIVE: "Tu acceso administrativo se encuentra deshabilitado.",
  ASSOCIATION_INACTIVE:
    "La asociación de tu cuenta se encuentra deshabilitada.",
  FORBIDDEN: "No tienes permisos para realizar esta acción.",
};

export class AuthorizationError extends Error {
  readonly code: AuthorizationErrorCode;

  constructor(code: AuthorizationErrorCode) {
    super(authorizationErrorMessages[code]);
    this.name = "AuthorizationError";
    this.code = code;
  }
}

export function isAuthorizationError(
  error: unknown,
): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

export function isSuperAdmin(
  profile: AdminProfile,
): profile is Extract<AdminProfile, { role: "SUPER_ADMIN" }> {
  return profile.role === "SUPER_ADMIN";
}

export function isAssociationAdmin(
  profile: AdminProfile,
): profile is Extract<AdminProfile, { role: "ASSOCIATION_ADMIN" }> {
  return profile.role === "ASSOCIATION_ADMIN";
}

export function canManageAssociation(
  profile: AdminProfile,
  associationId: string,
) {
  return isSuperAdmin(profile) || profile.associationId === associationId;
}

export function getAssociationScope(profile: AdminProfile) {
  return profile.associationId;
}

export async function requireAdminProfile() {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    throw new AuthorizationError(result.status);
  }

  return result.currentProfile;
}

export async function requireRole<TRole extends AdminRole>(
  ...roles: [TRole, ...TRole[]]
) {
  const profile = await requireAdminProfile();

  if (!roles.includes(profile.role as TRole)) {
    throw new AuthorizationError("FORBIDDEN");
  }

  return profile as Extract<AdminProfile, { role: TRole }>;
}

export async function requireAssociationAccess(associationId: string) {
  const profile = await requireAdminProfile();

  if (!canManageAssociation(profile, associationId)) {
    throw new AuthorizationError("FORBIDDEN");
  }

  return profile;
}
