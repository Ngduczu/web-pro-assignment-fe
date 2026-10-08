"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toApiError } from "@/lib/api/errors";
import { authSessionApi } from "@/lib/api/auth-session-client";
import type { UserProfileDto } from "@/types/api";

type AuthSession = { user: UserProfileDto; expiresAt: string };
type AuthSessionContextValue = { session: AuthSession | null; isLoading: boolean; refresh: () => Promise<AuthSession | null>; logout: () => Promise<void> };
const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

async function getSession() {
  const response = await fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" });
  if (response.status === 401) return null;
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as AuthSession;
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSession().then(setSession).finally(() => setIsLoading(false));
  }, []);

  async function refresh() {
    const nextSession = await getSession();
    setSession(nextSession);
    return nextSession;
  }

  async function logout() {
    await authSessionApi.logout();
    setSession(null);
  }

  return <AuthSessionContext.Provider value={{ session, isLoading, refresh, logout }}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);
  if (!context) throw new Error("useAuthSession must be used inside AuthSessionProvider");
  return context;
}
