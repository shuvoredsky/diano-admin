/**
 * Authentication & RBAC Domain Types aligned with diano-server/src/modules/auth/auth.types.ts
 */

export interface AuthUserSummary {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  roles: string[];
  permissions?: string[];
  isSuperAdmin?: boolean;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AuthSuccessPayload {
  user: AuthUserSummary;
  accessToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

