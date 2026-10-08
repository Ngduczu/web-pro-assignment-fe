"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, X } from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import type { Role, UserProfileDto } from "@/types/api";
import { useLanguage } from "@/lib/i18n";

const copy = {
  en: { namePlaceholder: "e.g. Introduction to Web Development", descriptionPlaceholder: "What will students learn in this course?", closed: "Closed", createError: "Unable to create course." },
  vi: { namePlaceholder: "Ví dụ: Nhập môn phát triển Web", descriptionPlaceholder: "Học viên sẽ học được gì trong khóa học này?", closed: "Đã đóng", createError: "Không thể tạo khóa học." },
};

export function CourseCreateForm({ role, teacherId, teachers }: { role: Role; teacherId?: string; teachers: UserProfileDto[] }) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const text = copy[language];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxStudents, setMaxStudents] = useState("30");
  const [selectedTeacher, setSelectedTeacher] = useState(teacherId ?? teachers[0]?.id ?? "");
  const [status, setStatus] = useState<"Open" | "Closed">("Open");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    try {
      await clientApis.courses.create({ name, description: description || null, teacherId: selectedTeacher, maxStudents: Number(maxStudents), status });
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.createError);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 border border-primary bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">
        <BookOpen className="size-4" />
        {t("createCourse")}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-[3px]" />
          <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="create-course-title" className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-hidden border border-border bg-card shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/35 px-5 py-5 sm:px-6">
              <div className="flex gap-3"><div className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary"><BookOpen className="size-5" /></div><div><h2 id="create-course-title" className="text-lg font-semibold tracking-tight">{t("createCourse")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("createCourseDescription")}</p></div></div>
              <button type="button" onClick={() => setOpen(false)} aria-label={t("close")} className="flex size-9 shrink-0 items-center justify-center text-muted-foreground transition hover:bg-muted hover:text-foreground"><X className="size-5" /></button>
            </div>
            <div className="min-h-0 overflow-y-auto px-5 py-6 sm:px-6">
              <div className="grid gap-5">
                <div className="space-y-2"><label htmlFor="course-name" className="text-sm font-medium">{t("courseName")} <span className="text-destructive">*</span></label><input id="course-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder={text.namePlaceholder} className="h-11 w-full border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30" /></div>
                <div className="space-y-2"><label htmlFor="course-description" className="text-sm font-medium">{t("description")} <span className="font-normal text-muted-foreground">({t("optional")})</span></label><textarea id="course-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder={text.descriptionPlaceholder} rows={4} className="w-full resize-y border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30" /></div>
                <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><label htmlFor="course-capacity" className="text-sm font-medium">{t("maximumStudents")} <span className="text-destructive">*</span></label><input id="course-capacity" required min="1" type="number" value={maxStudents} onChange={(event) => setMaxStudents(event.target.value)} className="h-11 w-full border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30" /></div><div className="space-y-2"><label htmlFor="course-status" className="text-sm font-medium">{t("courseStatus")}</label><select id="course-status" value={status} onChange={(event) => setStatus(event.target.value as "Open" | "Closed")} className="h-11 w-full border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"><option value="Open">{t("openForEnrollment")}</option><option value="Closed">{text.closed}</option></select></div></div>
                {role === "Admin" ? <div className="space-y-2"><label htmlFor="course-teacher" className="text-sm font-medium">{t("courseTeacher")} <span className="text-destructive">*</span></label><select id="course-teacher" required value={selectedTeacher} onChange={(event) => setSelectedTeacher(event.target.value)} className="h-11 w-full border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"><option value="">{t("selectTeacher")}</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.fullName} · {teacher.email}</option>)}</select></div> : null}
                {error ? <p className="border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">{error}</p> : null}
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><button type="button" onClick={() => setOpen(false)} className="h-10 border border-border px-4 text-sm font-medium hover:bg-muted">{t("cancel")}</button><button type="submit" disabled={pending || !selectedTeacher} className="h-10 bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">{pending ? t("creating") : t("createCourse")}</button></div>
          </form>
        </div>
      ) : null}
    </>
  );
}
