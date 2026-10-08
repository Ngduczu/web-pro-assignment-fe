import { toApiError } from "@/lib/api/errors";
import type { AuthenticatedSession, LoginRequest, OAuthLoginCodeRequest, RefreshTokenRequest, SessionResponse } from "@/types/api";

async function sessionRequest<T>(path: string, body?: unknown) {
  const response = await fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const authSessionApi = {
  login: (body: LoginRequest) => sessionRequest<SessionResponse>("login", body),
  refresh: (body?: RefreshTokenRequest) => sessionRequest<SessionResponse>("refresh", body),
  redeemLoginCode: (body: OAuthLoginCodeRequest) => sessionRequest<SessionResponse>("login-code", body),
  logout: () => sessionRequest<void>("logout"),
  getSession: async (): Promise<AuthenticatedSession | null> => {
    const response = await fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" });
    if (response.status === 401) return null;
    if (!response.ok) throw await toApiError(response);
    return (await response.json()) as AuthenticatedSession;
  },
};
