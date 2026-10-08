export type QueryValue = string | number | boolean | null | undefined;

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  rawBody?: BodyInit;
  signal?: AbortSignal;
  headers?: HeadersInit;
};

export type ApiTransport = <T>(path: string, options?: ApiRequestOptions) => Promise<T>;

export function withQuery(path: string, query?: Record<string, QueryValue>) {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function createRequestInit(options: ApiRequestOptions = {}): RequestInit {
  const headers = new Headers(options.headers);
  const body = options.rawBody ?? (options.body instanceof FormData ? options.body : options.body === undefined ? undefined : JSON.stringify(options.body));
  if (body !== undefined && !(body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  return { method: options.method ?? "GET", headers, body: body as BodyInit | undefined, signal: options.signal };
}
