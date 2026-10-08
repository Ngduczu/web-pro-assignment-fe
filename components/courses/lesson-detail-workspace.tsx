"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";
import type { CourseDto, LessonDto, MaterialDto } from "@/types/api";
import { LessonMaterials } from "@/components/courses/lesson-materials";

const copy = {
  en: {
    lesson: "Lesson", order: "Order", draft: "Draft", published: "Published", noContent: "No lesson content provided.",
    edit: "Edit lesson", editTitle: "Edit lesson information", editDescription: "Update the lesson title, content, and publishing status.",
    name: "Lesson name", content: "Content", status: "Status", orderHelp: "To change the order, return to the course and drag lessons in the Lessons tab.",
    cancel: "Cancel", save: "Save changes", saving: "Saving...", updateFailed: "Unable to update this lesson.",
  },
  vi: {
    lesson: "Bài học", order: "Thứ tự", draft: "Bản nháp", published: "Đã công bố", noContent: "Bài học chưa có nội dung.",
    edit: "Sửa bài học", editTitle: "Chỉnh sửa thông tin bài học", editDescription: "Cập nhật tên, nội dung và trạng thái công bố của bài học.",
    name: "Tên bài học", content: "Nội dung", status: "Trạng thái", orderHelp: "Để đổi thứ tự, quay lại khóa học và kéo thả bài học trong tab Bài học.",
    cancel: "Hủy", save: "Lưu thay đổi", saving: "Đang lưu...", updateFailed: "Không thể cập nhật bài học này.",
  },
};

type LessonDetailWorkspaceProps = {
  course: CourseDto;
  lesson: LessonDto;
  materials: MaterialDto[];
  canManage: boolean;
};

export function LessonDetailWorkspace({ course, lesson: initialLesson, materials, canManage }: LessonDetailWorkspaceProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const text = copy[language];
  const [lesson, setLesson] = useState(initialLesson);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialLesson.name);
  const [content, setContent] = useState(initialLesson.content ?? "");
  const [status, setStatus] = useState<LessonDto["status"]>(initialLesson.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const statusLabel = lesson.status === "Published" ? text.published : text.draft;

  function openEditor() {
    setName(lesson.name);
    setContent(lesson.content ?? "");
    setStatus(lesson.status);
    setError(undefined);
    setEditing(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      const updated = await clientApis.lessons.update(lesson.id, {
        name: name.trim(),
        content: content.trim() || null,
        order: lesson.order,
        status,
      });
      setLesson(updated);
      setEditing(false);
      router.refresh();
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.updateFailed);
    } finally {
      setSaving(false);
    }
  }

  return <>
    <div className="flex flex-wrap items-center gap-3 text-sm"><Link href={`/courses/${course.id}`} className="font-medium text-primary hover:underline">{course.name}</Link><span className="text-muted-foreground">/ {text.lesson}</span></div>
    <header className="flex max-w-4xl flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-3"><div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><span>{statusLabel}</span><span>{text.order} {lesson.order}</span></div><h1 className="break-words text-3xl font-semibold tracking-tight">{lesson.name}</h1></div>
      {canManage ? <button type="button" onClick={openEditor} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"><Pencil className="size-4" />{text.edit}</button> : null}
    </header>
    <article className="max-w-4xl whitespace-pre-wrap border-y border-border py-6 leading-7 text-foreground">{lesson.content || <span className="text-muted-foreground">{text.noContent}</span>}</article>
    <LessonMaterials lessonId={lesson.id} materials={materials} canManage={canManage} />

    {editing ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setEditing(false)} aria-label={text.cancel} /><form onSubmit={save} className="relative max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto border border-border bg-card p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">{text.editTitle}</h2><p className="mt-1 text-sm text-muted-foreground">{text.editDescription}</p></div><button type="button" onClick={() => setEditing(false)} aria-label={text.cancel} className="p-1"><X className="size-5" /></button></div><fieldset disabled={saving} className="mt-6 space-y-4 disabled:opacity-70"><label className="grid gap-2 text-sm font-medium">{text.name}<input required maxLength={200} value={name} onChange={(event) => setName(event.target.value)} className="h-10 border border-input bg-background px-3 font-normal" /></label><label className="grid gap-2 text-sm font-medium">{text.content}<textarea rows={9} value={content} onChange={(event) => setContent(event.target.value)} className="border border-input bg-background px-3 py-2 font-normal" /></label><label className="grid gap-2 text-sm font-medium">{text.status}<select value={status} onChange={(event) => setStatus(event.target.value as LessonDto["status"])} className="h-10 border border-input bg-background px-3 font-normal"><option value="Draft">{text.draft}</option><option value="Published">{text.published}</option></select></label><p className="text-xs text-muted-foreground">{text.orderHelp}</p></fieldset>{error ? <p role="alert" className="mt-4 border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setEditing(false)} className="h-10 border border-border px-4 text-sm font-medium">{text.cancel}</button><button disabled={saving} className="h-10 bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? text.saving : text.save}</button></div></form></div> : null}
  </>;
}
