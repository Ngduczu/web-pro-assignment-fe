import { Suspense } from "react";
import OAuthCallbackClient from "@/components/auth/oauth-callback-client";

export default function OAuthCallbackPage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Completing sign in...</div>}><OAuthCallbackClient /></Suspense>;
}
