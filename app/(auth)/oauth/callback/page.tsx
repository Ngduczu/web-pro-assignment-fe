import { Suspense } from "react";
import OAuthCallbackClient from "@/components/auth/oauth-callback-client";

export default function OAuthCallbackPage() {
  return <Suspense fallback={<div className="min-h-screen bg-background" />}><OAuthCallbackClient /></Suspense>;
}
