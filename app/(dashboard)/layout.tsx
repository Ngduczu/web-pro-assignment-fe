import type { ReactNode } from "react";
import { connection } from "next/server";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireAuth } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await connection();
  const { user } = await requireAuth();
  return <DashboardShell role={user.role}>{children}</DashboardShell>;
}
