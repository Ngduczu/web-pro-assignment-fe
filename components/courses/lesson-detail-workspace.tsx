"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Pencil, Trash2, X } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";
import type { CourseDto, LessonDto, MaterialDto } from "@/types/api";
import { LessonMaterials } from "@/components/courses/lesson-materials";

const copy = {
  en: {
    lesson: "Lesson",
    order: "Order",
    draft: "Draft",
    published: "Published",
    noContent: "No lesson content provided.",
    edit: "Edit lesson",
    editTitle: "Edit lesson information",
    editDescription: "Update the lesson title, content, and publishing status.",
    delete: "Delete lesson",
    deleteConfirm: "Are you sure you want to delete this lesson? All materials attached will be removed.",
    name: "Lesson name",
    content: "Content",
    status: "Status",
    orderHelp: "To change the order, return to the course and drag lessons in the Lessons tab.",
    cancel: "Cancel",
    save: "Save changes",
    saving: "Saving...",
    deleting: "Deleting...",
    updateFailed: "Unable to update this lesson.",
    deleteFailed: "Unable to delete this lesson.",
    sequence: "Lesson {current} of {total}",
    previous: "Previous lesson",
    next: "Next lesson",
    courseLessons: "Course lessons",
    reading: "Learning material",
    breadcrumb: "Breadcrumb",
  },
  vi: {
    lesson: "Bài học",
    order: "Thứ tự",
    draft: "Bản nháp",
    published: "Đã công bố",
    noContent: "Bài học chưa có nội dung.",
    edit: "Sửa bài học",
    editTitle: "Chỉnh sửa thông tin bài học",
    editDescription: "Cập nhật tên, nội dung và trạng thái công bố của bài học.",
    delete: "Xóa bài học",
    deleteConfirm: "Bạn có chắc chắn muốn xóa bài học này? Mọi tài liệu đính kèm sẽ bị xóa.",
    name: "Tên bài học",
    content: "Nội dung",
    status: "Trạng thái",
    orderHelp: "Để đổi thứ tự, quay lại khóa học và kéo thả bài học trong tab Bài học.",
    cancel: "Hủy",
    save: "Lưu thay đổi",
    saving: "Đang lưu...",
    deleting: "Đang xóa...",
    updateFailed: "Không thể cập nhật bài học này.",
    deleteFailed: "Không thể xóa bài học này.",
    sequence: "Bài {current} / {total}",
    previous: "Bài trước",
    next: "Bài tiếp theo",
    courseLessons: "Danh sách bài học",
    reading: "Nội dung học tập",
    breadcrumb: "Đường dẫn điều hướng",
  },
};

type LessonDetailWorkspaceProps = {
  course: CourseDto;
  lesson: LessonDto;
  lessons: LessonDto[];
  materials: MaterialDto[];
  canManage: boolean;
};

export function LessonDetailWorkspace({
  course,
  lesson: initialLesson,
  lessons,
  materials,
  canManage,
}: LessonDetailWorkspaceProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const text = copy[language];
  const [lesson, setLesson] = useState(initialLesson);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialLesson.name);
  const [content, setContent] = useState(initialLesson.content ?? "");
  const [status, setStatus] = useState<LessonDto["status"]>(initialLesson.status);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>();
  const statusLabel = lesson.status === "Published" ? text.published : text.draft;
  const orderedLessons = [...lessons]
    .filter((item) => item.courseId === course.id)
    .sort((left, right) => left.order - right.order);
  const currentIndex = orderedLessons.findIndex((item) => item.id === lesson.id);
  const previousLesson = currentIndex > 0 ? orderedLessons[currentIndex - 1] : undefined;
  const nextLesson = currentIndex >= 0 ? orderedLessons[currentIndex + 1] : undefined;
  const sequenceLabel = text.sequence
    .replace("{current}", String(Math.max(currentIndex + 1, 1)))
    .replace("{total}", String(orderedLessons.length));

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

  async function removeLesson() {
    if (!window.confirm(text.deleteConfirm)) return;
    setDeleting(true);
    setError(undefined);
    try {
      await clientApis.lessons.remove(lesson.id);
      router.push(`/courses/${course.id}`);
      router.refresh();
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.deleteFailed);
      setDeleting(false);
    }
  }

  return (
    <>
      {error ? (
        <p role="alert" className="border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label={text.breadcrumb} className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
          <Link href={`/courses/${course.id}`} className="truncate font-medium text-muted-foreground transition-colors hover:text-foreground">
            {course.name}
          </Link>
          <span aria-hidden="true" className="text-muted-foreground">/</span>
          <span className="text-foreground">{text.lesson} {lesson.order}</span>
        </nav>
        {orderedLessons.length > 0 ? (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <BookOpen className="size-3.5 text-primary" />
            {sequenceLabel}
          </span>
        ) : null}
      </div>

      <header className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:p-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <span>{text.reading}</span>
            <span aria-hidden="true" className="size-1 rounded-full bg-primary/50" />
            <span className="normal-case tracking-normal text-muted-foreground">{text.order} {lesson.order}</span>
            {canManage ? <span className="rounded-full border border-border px-2 py-1 normal-case tracking-normal text-muted-foreground">{statusLabel}</span> : null}
          </div>
          <h1 className="wrap-break-word text-3xl font-semibold tracking-tight sm:text-4xl">{lesson.name}</h1>
        </div>
        {canManage ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={openEditor}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <Pencil className="size-4" />
              {text.edit}
            </button>
            <button
              type="button"
              onClick={removeLesson}
              disabled={deleting || saving}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
            >
              <Trash2 className="size-4" />
              {deleting ? text.deleting : text.delete}
            </button>
          </div>
        ) : null}
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
        <article className="min-w-0 rounded-2xl border border-border bg-card px-5 py-6 text-[15px] leading-8 text-foreground sm:px-8 sm:py-9 sm:text-base">
          <div className="mx-auto max-w-3xl">
            {lesson.content ? (
              <div className="whitespace-pre-wrap wrap-anywhere">{lesson.content}</div>
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-sm leading-6 text-muted-foreground">{text.noContent}</p>
            )}
          </div>
        </article>

        <aside className="min-w-0 space-y-5 xl:sticky xl:top-6">
          <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold">{text.courseLessons}</h2>
            <ol className="space-y-1">
              {orderedLessons.map((item, index) => (
                <li key={item.id}>
                  <Link
                    href={`/courses/${course.id}/lessons/${item.id}`}
                    aria-current={item.id === lesson.id ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${item.id === lesson.id ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${item.id === lesson.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index + 1}</span>
                    <span className="min-w-0 truncate">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
          <LessonMaterials lessonId={lesson.id} materials={materials} canManage={canManage} />
        </aside>
      </div>

      <nav aria-label={text.courseLessons} className="grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
        {previousLesson ? (
          <Link href={`/courses/${course.id}/lessons/${previousLesson.id}`} className="group flex min-h-16 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted">
            <ArrowLeft className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
            <span className="min-w-0"><span className="block text-xs text-muted-foreground">{text.previous}</span><span className="block truncate text-sm font-semibold">{previousLesson.name}</span></span>
          </Link>
        ) : <div />}
        {nextLesson ? (
          <Link href={`/courses/${course.id}/lessons/${nextLesson.id}`} className="group flex min-h-16 items-center justify-end gap-3 rounded-xl border border-border bg-card px-4 py-3 text-right transition-colors hover:bg-muted">
            <span className="min-w-0"><span className="block text-xs text-muted-foreground">{text.next}</span><span className="block truncate text-sm font-semibold">{nextLesson.name}</span></span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </nav>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setEditing(false)}
            aria-label={text.cancel}
          />
          <form
            onSubmit={save}
            className="relative max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto border border-border bg-card p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{text.editTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{text.editDescription}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label={text.cancel}
                className="p-1"
              >
                <X className="size-5" />
              </button>
            </div>
            <fieldset disabled={saving} className="mt-6 space-y-4 disabled:opacity-70">
              <label className="grid gap-2 text-sm font-medium">
                {text.name}
                <input
                  required
                  maxLength={200}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-10 border border-input bg-background px-3 font-normal"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                {text.content}
                <textarea
                  rows={9}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className="border border-input bg-background px-3 py-2 font-normal"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                {text.status}
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as LessonDto["status"])}
                  className="h-10 border border-input bg-background px-3 font-normal"
                >
                  <option value="Draft">{text.draft}</option>
                  <option value="Published">{text.published}</option>
                </select>
              </label>
              <p className="text-xs text-muted-foreground">{text.orderHelp}</p>
            </fieldset>
            {error ? (
              <p role="alert" className="mt-4 border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="h-10 border border-border px-4 text-sm font-medium"
              >
                {text.cancel}
              </button>
              <button
                disabled={saving}
                className="h-10 bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {saving ? text.saving : text.save}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
