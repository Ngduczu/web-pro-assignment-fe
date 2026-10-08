import { toApiError } from "@/lib/api/errors";
import { createRequestInit, withQuery, type ApiRequestOptions } from "@/lib/api/transport";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return (await response.json()) as T;
  return (await response.blob()) as T;
}

export async function clientRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const response = await fetch(`/api/backend${withQuery(path, options.query)}`, {
    ...createRequestInit(options),
    credentials: "same-origin",
    cache: "no-store",
  });
  return parseResponse<T>(response);
}
