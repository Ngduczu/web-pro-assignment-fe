"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardCheck, LayoutDashboard, MessageCircle, Settings2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "Student" | "Teacher" | "Admin";

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
};

const navigation: NavigationItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard, roles: ["Student", "Teacher", "Admin"] },
  { label: "My courses", href: "/courses", icon: BookOpen, roles: ["Student", "Teacher", "Admin"] },
  { label: "Examinations", href: "/exams", icon: ClipboardCheck, roles: ["Student", "Teacher", "Admin"] },
  { label: "Messages", href: "/chat", icon: MessageCircle, roles: ["Student", "Teacher", "Admin"] },
  { label: "Users", href: "/admin/users", icon: Users, roles: ["Admin"] },
];

const roleLabels: Record<Role, string> = { Student: "Student workspace", Teacher: "Teacher workspace", Admin: "Administration" };

type AppSidebarProps = { role: Role; mobile?: boolean; onNavigate?: () => void };

export function AppSidebar({ role, mobile = false, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const visibleNavigation = navigation.filter((item) => item.roles.includes(role));

  return (
    <aside className={cn("flex h-full flex-col bg-sidebar text-sidebar-foreground", mobile ? "w-full" : "w-64 border-r border-sidebar-border")}>
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
        <Link href="/" className="flex items-center gap-3" onClick={onNavigate}>
          <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">L</span>
          <span className="text-sm font-semibold tracking-tight">LMS Portal</span>
        </Link>
      </div>
      <div className="px-5 pb-2 pt-6 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/55">{roleLabels[role]}</div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Main navigation">
        {visibleNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                isActive ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <Link href="/settings" onClick={onNavigate} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground">
          <Settings2 className="size-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}

export type { Role };
