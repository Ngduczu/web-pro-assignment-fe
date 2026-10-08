import { cookies } from "next/headers";
import { serverBackendRequest } from "@/lib/api/server-client";
import { handleSessionResponse } from "@/lib/api/session-route";

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined);
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("lms_refresh_token")?.value;
  const response = await serverBackendRequest("/auth/refresh", { method: "POST", body: body ?? { refreshToken } }, false);
  return handleSessionResponse(response);
}
