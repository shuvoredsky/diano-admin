import type {
  AdminLoginRequest,
  AuthSuccessPayload,
  AuthUserSummary,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types/auth.types';

export type {
  AdminLoginRequest as LoginCredentials,
  AuthSuccessPayload as AuthSessionResponse,
  AuthUserSummary,
  ForgotPasswordRequest as ForgotPasswordPayload,
  ResetPasswordRequest as ResetPasswordPayload,
};
