"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

export function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const segments = pathname.split("/").filter(Boolean);
  const localizedLabels: Record<string, string> = {
    student: t("studentWorkspace"),
    teacher: t("teacherWorkspace"),
    admin: t("administration"),
    courses: t("courses"),
    lessons: t("lessons"),
    assignments: t("assignments"),
    exercises: t("assignments"),
    examinations: t("examinations"),
    enrollments: t("enrollments"),
    exams: t("examinations"),
    "exam-attempts": t("examAttempts"),
    "question-banks": t("questionBanks"),
    chat: t("chat"),
    profile: t("profile"),
    settings: t("settings"),
    users: t("users"),
  };

  return (
    <nav aria-label={t("breadcrumb")} className="hidden min-w-0 items-center gap-1.5 text-sm text-primary-foreground/70 md:flex">
      <Link href="/" className="rounded-sm p-1 transition-colors hover:text-primary-foreground" aria-label={t("home")}>
        <Home className="size-4" />
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const label = localizedLabels[segment] ?? (segment.length > 18 ? t("details") : segment);
        const isLast = index === segments.length - 1;

        return (
          <span key={href} className="flex min-w-0 items-center gap-1.5">
            <ChevronRight className="size-3.5 shrink-0" />
            <Link href={href} className={cn("truncate transition-colors hover:text-primary-foreground", isLast && "font-medium text-primary-foreground")}>
              {label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
