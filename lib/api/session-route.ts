import "server-only";

import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/api/server-client";
import type { LoginResponse, SessionResponse } from "@/types/api";

function sessionMetadata(session: LoginResponse): SessionResponse {
  return { expiresAt: session.expiresAt, refreshTokenExpiresAt: session.refreshTokenExpiresAt };
}

function authCookieOptions(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge };
}

export async function handleSessionResponse(response: Response) {
  if (!response.ok) {
    return new NextResponse(response.body, { status: response.status, headers: { "content-type": response.headers.get("content-type") ?? "application/problem+json" } });
  }

  const session = (await response.json()) as LoginResponse;
  const authResponse = NextResponse.json(sessionMetadata(session));
  const accessMaxAge = Math.max(1, Math.floor((Date.parse(session.expiresAt) - Date.now()) / 1000));
  const refreshMaxAge = Math.max(1, Math.floor((Date.parse(session.refreshTokenExpiresAt) - Date.now()) / 1000));

  authResponse.cookies.set(ACCESS_TOKEN_COOKIE, session.accessToken, authCookieOptions(accessMaxAge));
  authResponse.cookies.set(REFRESH_TOKEN_COOKIE, session.refreshToken, authCookieOptions(refreshMaxAge));

  return authResponse;
}

export async function clearSession() {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}
