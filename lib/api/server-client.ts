import "server-only";

import { cookies } from "next/headers";
import { toApiError } from "@/lib/api/errors";
import { createRequestInit, withQuery, type ApiRequestOptions } from "@/lib/api/transport";
import type { LoginResponse } from "@/types/api";

const ACCESS_TOKEN_COOKIE = "lms_access_token";
const REFRESH_TOKEN_COOKIE = "lms_refresh_token";
const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:5258/api";

type CookieStore = {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options?: Record<string, unknown>): void;
  delete(name: string): void;
};

function authCookieOptions(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge };
}

export function setAuthCookies(cookieStore: CookieStore, session: LoginResponse) {
  const accessMaxAge = Math.max(1, Math.floor((Date.parse(session.expiresAt) - Date.now()) / 1000));
  const refreshMaxAge = Math.max(1, Math.floor((Date.parse(session.refreshTokenExpiresAt) - Date.now()) / 1000));
  try {
    cookieStore.set(ACCESS_TOKEN_COOKIE, session.accessToken, authCookieOptions(accessMaxAge));
    cookieStore.set(REFRESH_TOKEN_COOKIE, session.refreshToken, authCookieOptions(refreshMaxAge));
  } catch {}
}

export function clearAuthCookies(cookieStore: CookieStore) {
  try {
    cookieStore.delete(ACCESS_TOKEN_COOKIE);
    cookieStore.delete(REFRESH_TOKEN_COOKIE);
  } catch {}
}

function makeBackendUrl(path: string) {
  return `${backendUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function fetchBackend(path: string, init: RequestInit, accessToken?: string) {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  return fetch(makeBackendUrl(path), { ...init, headers, cache: "no-store" });
}

export async function serverBackendRequest(path: string, options: ApiRequestOptions = {}, retryOnUnauthorized = true, requestAccessToken?: string): Promise<Response> {
  const cookieStore = (await cookies()) as unknown as CookieStore;
  const accessToken = requestAccessToken ?? cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const init = createRequestInit(options);
  const response = await fetchBackend(withQuery(path, options.query), init, accessToken);

  if (response.status !== 401 || !retryOnUnauthorized || !refreshToken) return response;

  const refreshResponse = await fetchBackend("/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!refreshResponse.ok) {
    clearAuthCookies(cookieStore);
    return response;
  }

  const refreshedSession = (await refreshResponse.json()) as LoginResponse;
  setAuthCookies(cookieStore, refreshedSession);
  return fetchBackend(withQuery(path, options.query), init, refreshedSession.accessToken);
}

export async function serverRequest<T>(path: string, options: ApiRequestOptions = {}, requestAccessToken?: string) {
  const response = await serverBackendRequest(path, options, true, requestAccessToken);
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return (await response.json()) as T;
  return (await response.blob()) as T;
}

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE };
