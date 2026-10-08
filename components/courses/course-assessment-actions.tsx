"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookPlus, ClipboardPlus, FilePlus2, Paperclip, X } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";
import type { CourseDto, QuestionBankDto } from "@/types/api";
import { ExaminationCreateDialog } from "@/components/examinations/examination-create-dialog";
import { LessonCreateDialog } from "@/components/courses/lesson-create-dialog";

const copy = {
  en: { lesson: "Create lesson", exercise: "Create assignment", exam: "Create examination", title: "New assignment", description: "Create an assignment and attach its instructions directly inside this course.", name: "Title", details: "Description", due: "Due date", attachment: "Attachment", chooseFile: "Choose file", fileHint: "Optional, maximum 20 MB.", removeFile: "Remove", cancel: "Cancel", creating: "Creating and uploading...", create: "Create draft", failure: "Unable to create assignment.", fileTooLarge: "The attachment must be 20 MB or smaller.", partialFailure: "The assignment was created, but its attachment could not be uploaded. Open the assignment to retry.", openExercise: "Open assignment", noBank: "Create a question bank before adding an examination.", banks: "Open question banks" },
  vi: { lesson: "Tạo bài học", exercise: "Tạo bài tập", exam: "Tạo kỳ thi", title: "Bài tập mới", description: "Tạo bài tập và đính kèm tài liệu hướng dẫn trực tiếp trong khóa học.", name: "Tiêu đề", details: "Mô tả", due: "Hạn nộp", attachment: "Tệp đính kèm", chooseFile: "Chọn tệp", fileHint: "Không bắt buộc, tối đa 20 MB.", removeFile: "Xóa", cancel: "Hủy", creating: "Đang tạo và tải tệp...", create: "Tạo bản nháp", failure: "Không thể tạo bài tập.", fileTooLarge: "Tệp đính kèm không được vượt quá 20 MB.", partialFailure: "Bài tập đã được tạo nhưng tệp đính kèm chưa tải lên được. Hãy mở bài tập để thử lại.", openExercise: "Mở bài tập", noBank: "Hãy tạo ngân hàng câu hỏi trước khi thêm kỳ thi.", banks: "Mở ngân hàng câu hỏi" },
};

type AuthoringKind = "lesson" | "assignment" | "examination";

export function CourseAssessmentActions({ kind, course, banks, nextLessonOrder }: { kind: AuthoringKind; course: CourseDto; banks: QuestionBankDto[]; nextLessonOrder: number }) {
  const router = useRouter();
  const { language } = useLanguage();
  const text = copy[language];
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [exerciseFile, setExerciseFile] = useState<File>();
  const [createdExerciseId, setCreatedExerciseId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function createExercise(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError(undefined);
    try {
      const exercise = await clientApis.assignments.createExercise(course.id, { title: title.trim(), description: description.trim() || null, dueAt: dueAt ? new Date(dueAt).toISOString() : null });
      if (exerciseFile) {
        try { await clientApis.assignments.uploadAttachment(exercise.id, exerciseFile); }
        catch { setCreatedExerciseId(exercise.id); setError(text.partialFailure); return; }
      }
      setExerciseOpen(false); setTitle(""); setDescription(""); setDueAt(""); setExerciseFile(undefined); router.refresh();
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.failure);
    } finally { setBusy(false); }
  }

  function selectExerciseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size >= 20_000_000) { setError(text.fileTooLarge); return; }
    setError(undefined); setExerciseFile(file);
  }

  function openCreatedExercise() {
    if (!createdExerciseId) return;
    setExerciseOpen(false); router.refresh(); router.push(`/courses/${course.id}/exercises/${createdExerciseId}`);
  }

  return <>
    <div className="flex flex-wrap items-center gap-2">
      {kind === "lesson" ? <button type="button" onClick={() => setLessonOpen(true)} className="inline-flex min-h-10 items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><BookPlus className="size-4" />{text.lesson}</button> : null}
      {kind === "assignment" ? <button type="button" onClick={() => { setError(undefined); setCreatedExerciseId(undefined); setExerciseOpen(true); }} className="inline-flex min-h-10 items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><FilePlus2 className="size-4" />{text.exercise}</button> : null}
      {kind === "examination" ? <button type="button" disabled={!banks.length} onClick={() => setExamOpen(true)} className="inline-flex min-h-10 items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"><ClipboardPlus className="size-4" />{text.exam}</button> : null}
      {kind === "examination" && !banks.length ? <span className="basis-full text-xs text-amber-700">{text.noBank} <Link href="/question-banks" className="font-medium underline">{text.banks}</Link></span> : null}
    </div>
    {kind === "lesson" && lessonOpen ? <LessonCreateDialog courseId={course.id} nextOrder={nextLessonOrder} onClose={() => setLessonOpen(false)} onCreated={() => { setLessonOpen(false); router.refresh(); }} /> : null}
    {kind === "assignment" && exerciseOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setExerciseOpen(false)} aria-label={text.cancel} /><form onSubmit={createExercise} className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto border border-border bg-card p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">{text.title}</h2><p className="mt-1 text-sm text-muted-foreground">{text.description}</p></div><button type="button" onClick={() => setExerciseOpen(false)}><X className="size-5" /></button></div><fieldset disabled={busy || Boolean(createdExerciseId)} className="mt-6 space-y-4 disabled:opacity-70"><label className="grid gap-2 text-sm font-medium">{text.name}<input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} className="h-10 border border-input bg-background px-3 font-normal" /></label><label className="grid gap-2 text-sm font-medium">{text.details}<textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="border border-input bg-background px-3 py-2 font-normal" /></label><label className="grid gap-2 text-sm font-medium">{text.due}<input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="h-10 border border-input bg-background px-3 font-normal" /></label><div className="space-y-2"><p className="text-sm font-medium">{text.attachment}</p><p className="text-xs text-muted-foreground">{text.fileHint}</p>{exerciseFile ? <div className="flex items-center gap-3 border border-border p-3"><Paperclip className="size-4 shrink-0 text-primary" /><span className="min-w-0 flex-1 truncate text-sm">{exerciseFile.name}</span><button type="button" onClick={() => setExerciseFile(undefined)} className="text-xs font-medium text-destructive">{text.removeFile}</button></div> : <label className="inline-flex cursor-pointer border border-border px-3 py-2 text-sm font-medium hover:bg-muted"><input type="file" className="sr-only" onChange={selectExerciseFile} />{text.chooseFile}</label>}</div></fieldset>{error ? <p className="mt-4 border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setExerciseOpen(false)} className="h-10 border border-border px-4 text-sm font-medium">{text.cancel}</button>{createdExerciseId ? <button type="button" onClick={openCreatedExercise} className="h-10 bg-primary px-4 text-sm font-semibold text-primary-foreground">{text.openExercise}</button> : <button disabled={busy} className="h-10 bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? text.creating : text.create}</button>}</div></form></div> : null}
    {kind === "examination" && examOpen ? <ExaminationCreateDialog courses={[course]} banks={banks} onClose={() => setExamOpen(false)} onCreated={() => { setExamOpen(false); router.refresh(); }} /> : null}
  </>;
}
