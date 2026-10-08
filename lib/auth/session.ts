import "server-only";

import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { serverRequest } from "@/lib/api/server-client";
import type { Role, UserProfileDto } from "@/types/api";

const accessTokenCookie = "lms_access_token";
const nameIdentifierClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

type AccessClaims = { sub?: string; exp?: number; [nameIdentifierClaim]?: string };

export async function getCurrentUser(request?: Request): Promise<{ user: UserProfileDto; expiresAt: string } | null> {
  const requestToken = request && "cookies" in request ? (request as NextRequest).cookies.get(accessTokenCookie)?.value : undefined;
  const token = requestToken ?? request?.headers.get("cookie")?.match(new RegExp(`${accessTokenCookie}=([^;]+)`))?.[1] ?? (await cookies()).get(accessTokenCookie)?.value;
  if (!token) return null;

  try {
    const claims = decodeJwt(token) as AccessClaims;
    const userId = claims.sub ?? claims[nameIdentifierClaim];
    if (!userId) return null;
    const user = await serverRequest<UserProfileDto>(`/users/${userId}/profile`, {}, token);
    return { user, expiresAt: claims.exp ? new Date(claims.exp * 1000).toISOString() : "" };
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) return null;
    return null;
  }
}

export async function requireAuth() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) redirect("/forbidden");
  return session;
}
