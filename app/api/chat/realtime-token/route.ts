import { NextResponse } from "next/server";
import { serverBackendRequest } from "@/lib/api/server-client";
import type { ChatRealtimeSession } from "@/types/api";

type BackendChatRealtimeToken = Omit<ChatRealtimeSession, "hubUrl">;

function getHubUrl() {
  const configuredHubUrl = process.env.BACKEND_HUB_URL?.trim();
  if (configuredHubUrl) return configuredHubUrl;

  const apiUrl = new URL(process.env.BACKEND_API_URL ?? "http://localhost:5258/api");
  apiUrl.pathname = `${apiUrl.pathname.replace(/\/api\/?$/, "").replace(/\/$/, "")}/hubs/chat`;
  apiUrl.search = "";
  apiUrl.hash = "";
  return apiUrl.toString();
}

export async function POST() {
  const response = await serverBackendRequest("/chat/realtime-token", { method: "POST" });
  if (!response.ok) {
    return new NextResponse(response.body, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") ?? "application/problem+json" },
    });
  }

  const token = (await response.json()) as BackendChatRealtimeToken;
  return NextResponse.json(
    { ...token, hubUrl: getHubUrl() } satisfies ChatRealtimeSession,
    { headers: { "Cache-Control": "no-store" } },
  );
}
