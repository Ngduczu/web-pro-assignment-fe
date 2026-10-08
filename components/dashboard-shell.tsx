import type { ReactNode } from "react";
import { AppSidebar, type Role } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

export function DashboardShell({ children, role = "Student" }: { children: ReactNode; role?: Role }) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden xl:block">
        <AppSidebar role={role} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader role={role} />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
