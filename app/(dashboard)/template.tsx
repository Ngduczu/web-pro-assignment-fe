import type { ReactNode } from "react";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/loading-skeleton";

export default function DashboardTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="motion-page-enter">
      <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
    </div>
  );
}