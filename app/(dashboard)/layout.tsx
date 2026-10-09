import type { ReactNode } from "react";
import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { requireAuth } from "@/lib/auth/session";

export const instant = false;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AuthenticatedDashboardLayout>{children}</AuthenticatedDashboardLayout>
    </Suspense>
  );
}

async function AuthenticatedDashboardLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAuth();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
