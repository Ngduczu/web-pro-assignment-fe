"use client";

import { useLanguage } from "@/lib/i18n";

export default function DashboardRouteError({ reset }: { reset: () => void }) {
  const { language } = useLanguage();
  const isVi = language === "vi";

  return <section className="space-y-4 border border-destructive/40 bg-destructive/5 p-6"><h1 className="text-xl font-semibold">{isVi ? "Không thể tải trang tổng quan" : "Dashboard unavailable"}</h1><p className="text-sm text-muted-foreground">{isVi ? "Đã xảy ra lỗi không mong muốn khi tải trang tổng quan." : "The dashboard encountered an unexpected error while loading."}</p><button type="button" onClick={() => reset()} className="border border-border px-4 py-2 text-sm font-medium hover:bg-muted">{isVi ? "Thử lại" : "Try again"}</button></section>;
}