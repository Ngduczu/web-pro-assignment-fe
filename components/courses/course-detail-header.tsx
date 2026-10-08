"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import type { CourseDto, EnrollmentDto, Role } from "@/types/api";
import { CourseEnrollmentAction } from "@/components/courses/course-enrollment-action";

const copy = {
  en: { back: "Back to courses", open: "Open", closed: "Closed", capacity: "Capacity", noDescription: "No description provided.", updated: "Updated", joinTitle: "Join this course to access its content", joinDescription: "After your enrollment is accepted, lessons, assignments and examinations will appear here." },
  vi: { back: "Quay lại danh sách khóa học", open: "Đang mở", closed: "Đã đóng", capacity: "Sức chứa", noDescription: "Chưa có mô tả.", updated: "Cập nhật", joinTitle: "Đăng ký khóa học để truy cập nội dung", joinDescription: "Sau khi yêu cầu được chấp nhận, bài học, bài tập và kỳ thi sẽ hiển thị tại đây." },
};

export function CourseDetailHeader({ course, role, enrollment }: { course: CourseDto; role: Role; enrollment?: EnrollmentDto }) {
  const { language } = useLanguage();
  const text = copy[language];
  const date = new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", { dateStyle: "medium" });
  return <>
    <Link href="/courses" className="text-sm font-medium text-primary hover:underline">{text.back}</Link>
    <header className="grid gap-6 border-b border-border pb-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><div className="max-w-3xl space-y-3"><div className="flex flex-wrap items-center gap-3"><span className="text-sm font-medium text-primary">{course.status === "Open" ? text.open : text.closed}</span><span className="text-sm text-muted-foreground">{text.capacity} {course.maxStudents}</span></div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{course.name}</h1><p className="leading-7 text-muted-foreground">{course.description || text.noDescription}</p><p className="text-sm text-muted-foreground">{text.updated} {date.format(new Date(course.modifiedAt))}</p></div>{role === "Student" ? <CourseEnrollmentAction courseId={course.id} enrollment={enrollment} courseStatus={course.status} /> : null}</header>
  </>;
}

export function CourseAccessNotice() {
  const { language } = useLanguage();
  const text = copy[language];
  return <div className="border border-primary/25 bg-primary/5 p-5 sm:p-6"><h2 className="font-semibold">{text.joinTitle}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text.joinDescription}</p></div>;
}
