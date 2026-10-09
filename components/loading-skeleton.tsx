"use client";

import { useLanguage } from "@/lib/i18n";

export function DashboardSkeleton() {
  const { language } = useLanguage();
  const loadingLabel = language === "vi" ? "Đang tải" : "Loading";

  return (
    <div className="space-y-8" aria-label={loadingLabel} role="status">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-md border border-border bg-card" />)}
      </div>
      <div className="h-72 animate-pulse rounded-md border border-border bg-card" />
      <span className="sr-only">{language === "vi" ? "Đang tải trang tổng quan" : "Loading dashboard"}</span>
    </div>
  );
}
