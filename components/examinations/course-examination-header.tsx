import Link from "next/link";
import type { CourseDto, ExaminationDto, StudentExaminationDto } from "@/types/api";
import type { Language } from "@/lib/i18n";

const copy = {
  en: { back: "Back to course examinations", noDescription: "No description provided.", Draft: "Draft", Published: "Published", Closed: "Closed" },
  vi: { back: "Quay lại danh sách kỳ thi của khóa học", noDescription: "Chưa có mô tả.", Draft: "Bản nháp", Published: "Đã công bố", Closed: "Đã đóng" },
};

export function CourseExaminationHeader({ course, examination, language }: { course: CourseDto; examination: ExaminationDto | StudentExaminationDto; language: Language }) {
  const text = copy[language];
  const formatter = new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", { dateStyle: "medium", timeStyle: "short" });
  const status = text[examination.status as keyof typeof text] ?? examination.status;

  return (
    <>
      <Link href={`/courses/${course.id}?tab=examinations`} className="text-sm font-medium text-primary hover:underline">
        {text.back}
      </Link>
      <header className="max-w-3xl">
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href={`/courses/${course.id}?tab=examinations`} className="font-medium text-primary hover:underline">{course.name}</Link>
          <span className="text-muted-foreground">· {status}</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{examination.title}</h1>
        <p className="mt-3 leading-7 text-muted-foreground">{examination.description || text.noDescription}</p>
        <p className="mt-3 text-sm text-muted-foreground">{formatter.format(new Date(examination.startAt))} — {formatter.format(new Date(examination.dueAt))}</p>
      </header>
    </>
  );
}
