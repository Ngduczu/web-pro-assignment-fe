"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import type { UserProfileDto } from "@/types/api";

export function DashboardShell({ children, user }: { children: ReactNode; user: UserProfileDto }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isChatPage = usePathname() === "/chat";

  return (
    <div className="flex min-h-screen bg-background xl:h-screen xl:overflow-hidden">
      <div className={`hidden shrink-0 overflow-y-auto transition-[width] duration-200 ease-in-out xl:block xl:h-full ${sidebarCollapsed ? "w-16" : "w-64"}`}>
        <AppSidebar
          role={user.role}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col xl:h-full xl:min-h-0">
        <DashboardHeader user={user} />
        <main className="flex-1 xl:min-h-0 xl:overflow-y-auto">
          <div className={`mx-auto w-full py-8 ${isChatPage ? "max-w-none px-4 sm:px-6 lg:px-0" : "max-w-7xl px-4 sm:px-6 lg:px-8"}`}>{children}</div>
        </main>
      </div>
    </div>
  );
}
