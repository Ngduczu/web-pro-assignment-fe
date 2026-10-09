"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, CalendarDays, MessageSquare, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { CourseDto, EnrollmentDto, Role } from "@/types/api";
import { CourseEnrollmentAction } from "@/components/courses/course-enrollment-action";

const copy = {
  en: { back: "Back to courses", open: "Open", closed: "Closed", capacity: "Capacity", noDescription: "No description provided.", updated: "Updated", joinTitle: "Join this course to access its content", joinDescription: "After your enrollment is accepted, lessons, assignments and examinations will appear here.", chat: "Course Chat" },
  vi: { back: "Quay lại danh sách khóa học", open: "Đang mở", closed: "Đã đóng", capacity: "Sức chứa", noDescription: "Chưa có mô tả.", updated: "Cập nhật", joinTitle: "Đăng ký khóa học để truy cập nội dung", joinDescription: "Sau khi yêu cầu được chấp nhận, bài học, bài tập và kỳ thi sẽ hiển thị tại đây.", chat: "Trò chuyện lớp học" },
};

export function CourseDetailHeader({ course, role, enrollment }: { course: CourseDto; role: Role; enrollment?: EnrollmentDto }) {
  const { language } = useLanguage();
  const text = copy[language];
  const date = new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", { dateStyle: "medium" });
  const canAccessChat = role !== "Student" || enrollment?.status === "Accepted";
  return <>
    <Link href="/courses" className="inline-flex min-h-9 items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary">
      <ArrowLeft className="size-4" aria-hidden="true" />
      {text.back}
    </Link>
    <header className="course-detail-hero relative overflow-hidden rounded-2xl border border-primary text-white shadow-xs">
      <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
      <div className="relative grid gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-8">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${course.status === "Open" ? "bg-white/20 text-white" : "bg-black/15 text-white/80"}`}>
              <span className={`size-1.5 rounded-full ${course.status === "Open" ? "bg-white" : "bg-white/70"}`} />
              {course.status === "Open" ? text.open : text.closed}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
              <Users className="size-3.5" aria-hidden="true" />
              {text.capacity} {course.maxStudents}
            </span>
          </div>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white sm:flex">
              <BookOpen className="size-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">{course.name}</h1>
              <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-6 text-white/85 sm:text-base sm:leading-7">{course.description || text.noDescription}</p>
            </div>
          </div>
          <p className="inline-flex items-center gap-2 text-xs text-white/80 sm:text-sm">
            <CalendarDays className="size-4" aria-hidden="true" />
            {text.updated} {date.format(new Date(course.modifiedAt))}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-white/25 pt-4 lg:justify-end lg:border-0 lg:pt-0">
          {canAccessChat ? (
            <Link
              href={`/chat?courseId=${course.id}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/80 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-white/90"
            >
              <MessageSquare className="size-4 text-emerald-700" aria-hidden="true" />
              <span>{text.chat}</span>
            </Link>
          ) : null}
          {role === "Student" ? <CourseEnrollmentAction courseId={course.id} enrollment={enrollment} courseStatus={course.status} onDarkBackground /> : null}
        </div>
      </div>
    </header>
  </>;
}

export function CourseAccessNotice() {
  const { language } = useLanguage();
  const text = copy[language];
  return <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 sm:p-7"><div className="flex items-start gap-4"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen className="size-5" aria-hidden="true" /></div><div><h2 className="font-semibold tracking-tight">{text.joinTitle}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{text.joinDescription}</p></div></div></div>;
}
