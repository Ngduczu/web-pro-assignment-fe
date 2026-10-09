import {
  HubConnectionBuilder,
  LogLevel,
  type HubConnection,
  type IRetryPolicy,
} from "@microsoft/signalr";
import { toApiError } from "@/lib/api/errors";
import type { ChatRealtimeSession } from "@/types/api";

async function requestRealtimeSession() {
  const response = await fetch("/api/chat/realtime-token", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as ChatRealtimeSession;
}

const reconnectForever: IRetryPolicy = {
  nextRetryDelayInMilliseconds(context) {
    return Math.min(30_000, 1_000 * 2 ** Math.min(context.previousRetryCount, 5));
  },
};

export async function createChatHubConnection(): Promise<HubConnection> {
  let session = await requestRealtimeSession();

  async function accessTokenFactory() {
    if (Date.parse(session.expiresAt) <= Date.now() + 15_000) {
      session = await requestRealtimeSession();
    }
    return session.accessToken;
  }

  return new HubConnectionBuilder()
    .withUrl(session.hubUrl, { accessTokenFactory })
    .withAutomaticReconnect(reconnectForever)
    .configureLogging(LogLevel.Warning)
    .build();
}
