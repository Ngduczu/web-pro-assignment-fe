import { serverBackendRequest } from "@/lib/api/server-client";
import { handleSessionResponse } from "@/lib/api/session-route";

export async function POST(request: Request) {
  const response = await serverBackendRequest("/auth/login", { method: "POST", body: await request.json() }, false);
  return handleSessionResponse(response);
}
