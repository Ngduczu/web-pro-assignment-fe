"use client";

import { Bell } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "@/types/api";

type DashboardHeaderProps = { user: UserProfileDto };

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { t } = useLanguage();
  return (
    <header className="dashboard-header flex min-h-16 items-center justify-between gap-4 border-b border-border bg-primary px-4 text-primary-foreground sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <MobileSidebar role={user.role} />
        <Breadcrumbs />
        <span className="truncate text-sm font-semibold md:hidden">SFIT Study</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label={t("notifications")}><Bell className="size-4" /></Button>
        <LanguageToggle tone="primary" />
        <ThemeToggle />
        <UserMenu name={user.fullName} email={user.email} role={user.role} />
      </div>
    </header>
  );
}
