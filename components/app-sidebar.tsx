"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, ClipboardCheck, Files, LayoutDashboard, MessageCircle, Settings2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

type Role = "Student" | "Teacher" | "Admin";

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
};

const navigation: NavigationItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard, roles: ["Student", "Teacher", "Admin"] },
  { label: "Courses", href: "/courses", icon: BookOpen, roles: ["Student", "Teacher", "Admin"] },
  { label: "Examinations", href: "/exams", icon: ClipboardCheck, roles: ["Student", "Teacher", "Admin"] },
  { label: "Question banks", href: "/question-banks", icon: Files, roles: ["Teacher", "Admin"] },
  { label: "Messages", href: "/chat", icon: MessageCircle, roles: ["Student", "Teacher", "Admin"] },
  { label: "Users", href: "/admin", icon: Users, roles: ["Admin"] },
];

// Keep the brand mark isolated so the club logo can replace the monogram later.
function SidebarBrandMark() {
  return (
    <span
      data-slot="sidebar-brand-mark"
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-lg font-bold text-sidebar-primary-foreground ring-1 ring-sidebar-primary/15"
    >
      S
    </span>
  );
}

type AppSidebarProps = {
  role: Role;
  mobile?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
};

export function AppSidebar({ role, mobile = false, collapsed = false, onNavigate, onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const isCollapsed = collapsed && !mobile;
  const visibleNavigation = navigation.filter((item) => item.roles.includes(role));
  const labels: Record<string, string> = {
    Overview: t("overview"),
    Courses: t("courses"),
    Examinations: t("examinations"),
    "Question banks": t("questionBanks"),
    Messages: t("messages"),
    Users: t("users"),
  };

  return (
    <aside className={cn("dashboard-sidebar flex h-full w-full flex-col bg-sidebar text-sidebar-foreground", !mobile && "border-r border-sidebar-border")}>
      <div className={cn("flex min-h-20 items-center border-b border-sidebar-border/70", isCollapsed ? "justify-center px-2" : "justify-between px-5")}>
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          onClick={onNavigate}
          aria-label={t("brand")}
          title={isCollapsed ? t("brand") : undefined}
        >
          <SidebarBrandMark />
          {!isCollapsed && <span className="truncate text-sm font-semibold tracking-tight">{t("brand")}</span>}
        </Link>
        {!mobile && !isCollapsed && onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 rounded-xl text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={onToggleCollapse}
            aria-label={t("collapseSidebar")}
            title={t("collapseSidebar")}
          >
            <ChevronLeft className="size-4" />
          </Button>
        )}
      </div>
      {!mobile && isCollapsed && onToggleCollapse && (
        <div className="flex justify-center py-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={onToggleCollapse}
            aria-label={t("expandSidebar")}
            title={t("expandSidebar")}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
      {!isCollapsed && (
        <div className="flex items-center gap-2 px-5 pb-3 pt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/55">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-sidebar-primary" />
          {role === "Student" ? t("studentWorkspace") : role === "Teacher" ? t("teacherWorkspace") : t("administration")}
        </div>
      )}
      <nav className={cn("flex-1 space-y-1 overflow-y-auto", isCollapsed ? "px-2" : "px-3")} aria-label={t("navigation")}>
        {visibleNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex min-h-11 items-center rounded-xl text-sm transition-colors",
                isCollapsed ? "justify-center px-0" : "gap-3 px-3",
                isActive
                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={isCollapsed ? labels[item.label] : undefined}
              title={isCollapsed ? labels[item.label] : undefined}
            >
              <Icon className={cn("size-[18px] shrink-0", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground")} />
              {!isCollapsed && <span className="min-w-0 truncate">{labels[item.label]}</span>}
            </Link>
          );
        })}
      </nav>
      <div className={cn("border-t border-sidebar-border/70", isCollapsed ? "p-2" : "px-3 py-3")}>
        <Link
          href="/profile"
          onClick={onNavigate}
          className={cn(
            "flex min-h-11 items-center rounded-xl text-sm transition-colors",
            isCollapsed ? "justify-center px-0" : "gap-3 px-3",
            pathname === "/profile"
              ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          )}
          aria-label={isCollapsed ? t("settings") : undefined}
          title={isCollapsed ? t("settings") : undefined}
        >
          <Settings2 className={cn("size-[18px] shrink-0", pathname === "/profile" ? "text-sidebar-primary" : "text-sidebar-foreground/60")} />
          {!isCollapsed && t("settings")}
        </Link>
      </div>
    </aside>
  );
}

export type { Role };
