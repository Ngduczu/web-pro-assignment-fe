"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { DashboardSkeleton } from "@/components/loading-skeleton";

export default function DashboardTemplate({ children }: { children: ReactNode }) {
  const isChatPage = usePathname() === "/chat";

  return (
    <div className={`motion-page-enter ${isChatPage ? "flex h-full min-h-0 flex-col" : ""}`}>
      <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
    </div>
  );
}