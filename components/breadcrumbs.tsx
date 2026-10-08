"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const labels: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Admin",
  courses: "Courses",
  enrollments: "Enrollments",
  exams: "Examinations",
  chat: "Chat",
  profile: "Profile",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm text-muted-foreground md:flex">
      <Link href="/" className="rounded-sm p-1 transition-colors hover:text-foreground" aria-label="Home">
        <Home className="size-4" />
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const label = labels[segment] ?? (segment.length > 18 ? "Details" : segment);
        const isLast = index === segments.length - 1;

        return (
          <span key={href} className="flex min-w-0 items-center gap-1.5">
            <ChevronRight className="size-3.5 shrink-0" />
            <Link href={href} className={cn("truncate transition-colors hover:text-foreground", isLast && "font-medium text-foreground")}>
              {label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
