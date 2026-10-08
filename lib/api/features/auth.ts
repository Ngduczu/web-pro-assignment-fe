import type { ApiTransport } from "@/lib/api/transport";
import type { EmailVerificationResultDto, ForgotPasswordRequest, PasswordResetRequestedDto, PasswordResetResultDto, RegisterAccountRequest, RegistrationDto, ResendVerificationRequest, ResetPasswordRequest, VerifyEmailRequest } from "@/types/api";

export function createAuthApi(request: ApiTransport) {
  return {
    register: (body: RegisterAccountRequest) => request<RegistrationDto>("/auth/register", { method: "POST", body }),
    verifyEmail: (body: VerifyEmailRequest) => request<EmailVerificationResultDto>("/auth/verify-email", { method: "POST", body }),
    resendVerification: (body: ResendVerificationRequest) => request<void>("/auth/resend-verification", { method: "POST", body }),
    forgotPassword: (body: ForgotPasswordRequest) => request<PasswordResetRequestedDto>("/auth/forgot-password", { method: "POST", body }),
    resetPassword: (body: ResetPasswordRequest) => request<PasswordResetResultDto>("/auth/reset-password", { method: "POST", body }),
    oauthAuthorize: (provider: string) => request<{ authorizationUrl: string }>(`/auth/oauth/${provider}/authorize`),
    oauthCallback: (provider: string, query: { code: string; state: string }) => request<unknown>(`/auth/oauth/${provider}/callback`, { query }),
    oauthLinkAuthorize: (provider: string) => request<{ authorizationUrl: string }>(`/auth/oauth/${provider}/link/authorize`),
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
