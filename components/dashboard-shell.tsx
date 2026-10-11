"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import type { UserProfileDto } from "@/types/api";

const shellMascots = [
  { src: "/assets/owlie/cling.webp", position: "left" },
  { src: "/assets/owlie/hang.webp", position: "top" },
  { src: "/assets/owlie/hug.webp", position: "bottom-right" },
  { src: "/assets/owlie/love.webp", position: "bottom-right" },
] as const;

export function DashboardShell({ children, user }: { children: ReactNode; user: UserProfileDto }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const [shellMascot, setShellMascot] = useState<(typeof shellMascots)[number] | null>(null);
  const isChatPage = pathname === "/chat";
  const isExamAttempt = pathname.startsWith("/exam-attempts/");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * shellMascots.length);
      setShellMascot(shellMascots[randomIndex]);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <div data-layout={isChatPage ? "chat" : undefined} className="dashboard-shell relative flex min-h-screen bg-background xl:h-screen xl:overflow-hidden">
      <div className={`hidden shrink-0 overflow-y-auto transition-[width] duration-200 ease-in-out xl:block xl:h-full ${sidebarCollapsed ? "w-16" : "w-64"}`}>
        <AppSidebar
          role={user.role}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
        />
      </div>
      <div className="dashboard-content relative z-10 flex min-w-0 flex-1 flex-col xl:h-full xl:min-h-0">
        <DashboardHeader user={user} />
        <main className="dashboard-main relative flex-1 xl:min-h-0 xl:overflow-y-auto">
          {shellMascot && !isChatPage && !isExamAttempt ? (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block">
              <div className={`absolute opacity-25 dark:opacity-20 ${shellMascot.position === "left" ? "left-4 top-1/2 size-64 -translate-y-1/2 xl:left-8 xl:size-80" : shellMascot.position === "top" ? "right-8 top-0 size-56 xl:right-16 xl:size-72" : "bottom-0 right-0 size-64 xl:size-80"}`}>
                <Image src={shellMascot.src} alt="" fill sizes="320px" loading="eager" className="object-contain" />
              </div>
            </div>
          ) : null}
          <div className="dashboard-main-inner relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
