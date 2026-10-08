import { NextResponse } from "next/server";
import { serverBackendRequest } from "@/lib/api/server-client";

type RouteContext = { params: Promise<{ path: string[] }> };
const blockedPaths = new Set(["auth/login", "auth/refresh", "auth/login-code"]);

async function proxy(request: Request, context: RouteContext) {
  const { path: pathSegments } = await context.params;
  const path = pathSegments.join("/");
  if (blockedPaths.has(path)) return NextResponse.json({ title: "Not Found", status: 404 }, { status: 404 });

  const url = new URL(request.url);
  const backendPath = `/${path}${url.search}`;
  const method = request.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("Cookie", cookie);
  const rawBody = method === "GET" ? undefined : await request.arrayBuffer();
  const response = await serverBackendRequest(backendPath, { method, headers, rawBody });
  const responseHeaders = new Headers();
  for (const header of ["content-type", "content-disposition", "content-length", "accept-ranges"]) {
    const value = response.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }
  const responseWithCookies = response.headers as Headers & { getSetCookie?: () => string[] };
  for (const cookie of responseWithCookies.getSetCookie?.() ?? []) responseHeaders.append("set-cookie", cookie);
  return new NextResponse(response.body, { status: response.status, headers: responseHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
