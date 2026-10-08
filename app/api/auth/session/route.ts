import { NextResponse, type NextRequest } from "next/server";
import { decodeJwt } from "jose";
import { ApiError } from "@/lib/api/errors";
import { serverRequest } from "@/lib/api/server-client";
import type { UserProfileDto } from "@/types/api";

const accessTokenCookie = "lms_access_token";
const nameIdentifierClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(accessTokenCookie)?.value;
  if (!token) return NextResponse.json({ title: "Unauthorized", status: 401, detail: "Authentication is required." }, { status: 401 });

  try {
    const claims = decodeJwt(token) as { sub?: string; exp?: number; [nameIdentifierClaim]?: string };
    const userId = claims.sub ?? claims[nameIdentifierClaim];
    if (!userId) throw new Error("The access token has no user id.");
    const user = await serverRequest<UserProfileDto>(`/users/${userId}/profile`, {}, token);
    return NextResponse.json({ user, expiresAt: claims.exp ? new Date(claims.exp * 1000).toISOString() : "" });
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
      return NextResponse.json({ title: "Unauthorized", status: 401, detail: "Authentication is required." }, { status: 401 });
    }
    return NextResponse.json({ title: "Unauthorized", status: 401, detail: "Authentication is required." }, { status: 401 });
  }
}
