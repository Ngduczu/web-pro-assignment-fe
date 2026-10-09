"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, MessageSquareText, Paperclip, Pencil, Trash2, X } from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import type { ExerciseDto, PaginatedResponse, SubmissionDto } from "@/types/api";
import { useLanguage } from "@/lib/i18n";
import { AssignmentSubmissions } from "@/components/courses/assignment-submissions";

const copy = {
  en: {
    title: "Assignment attachment",
    empty: "No instruction file is attached.",
    upload: "Upload attachment",
    replace: "Replace attachment",
    download: "Download",
    working: "Working...",
    tooLarge: "The file must be 20 MB or smaller.",
    uploadError: "Unable to upload the assignment attachment.",
    downloadError: "Unable to download the assignment attachment.",
    submissionUploadError: "Unable to upload submission.",
    submitError: "Unable to submit this assignment.",
    unsubmitError: "Unable to reopen this assignment.",
    statusError: "Unable to update assignment status.",
    publish: "Publish assignment",
    close: "Close assignment",
    editExercise: "Edit assignment",
    deleteExercise: "Delete assignment",
    deleteConfirm: "Are you sure you want to delete this assignment and all associated submissions?",
    editTitle: "Edit assignment",
    editDescription: "Update title, instructions, and submission deadline.",
    exerciseTitle: "Title",
    exerciseDescription: "Instructions",
    dueAt: "Due date & time",
    saveChanges: "Save changes",
    saving: "Saving...",
    deleting: "Deleting...",
    cancel: "Cancel",
    updateError: "Unable to update assignment.",
    deleteError: "Unable to delete assignment.",
    yourSubmission: "Your submission",
    status: "Status",
    grade: "Grade",
    feedback: "Feedback",
    submit: "Submit assignment",
    unsubmit: "Unsubmit",
    draftHint: "Upload a file to create your draft submission.",
    uploadSubmission: "Upload submission",
    draft: "Draft",
    submitted: "Submitted",
    graded: "Graded",
    gradingResult: "Grading result",
    teacherFeedback: "Teacher feedback",
    noFeedback: "No written feedback was provided.",
    gradedAt: "Graded at",
    awaitingGrade: "Your work is awaiting grading. Results on this page update automatically.",
  },
  vi: {
    title: "Tệp đính kèm bài tập",
    empty: "Chưa có tệp hướng dẫn đính kèm.",
    upload: "Tải tệp lên",
    replace: "Thay tệp đính kèm",
    download: "Tải xuống",
    working: "Đang xử lý...",
    tooLarge: "Tệp không được vượt quá 20 MB.",
    uploadError: "Không thể tải tệp đính kèm của bài tập lên.",
    downloadError: "Không thể tải tệp đính kèm của bài tập xuống.",
    submissionUploadError: "Không thể tải bài làm lên.",
    submitError: "Không thể nộp bài tập này.",
    unsubmitError: "Không thể mở lại bài tập này.",
    statusError: "Không thể cập nhật trạng thái bài tập.",
    publish: "Công bố bài tập",
    close: "Đóng bài tập",
    editExercise: "Sửa bài tập",
    deleteExercise: "Xóa bài tập",
    deleteConfirm: "Bạn có chắc chắn muốn xóa bài tập này cùng toàn bộ bài nộp của học viên?",
    editTitle: "Chỉnh sửa bài tập",
    editDescription: "Cập nhật tiêu đề, mô tả hướng dẫn và hạn nộp bài.",
    exerciseTitle: "Tiêu đề",
    exerciseDescription: "Mô tả hướng dẫn",
    dueAt: "Hạn nộp",
    saveChanges: "Lưu thay đổi",
    saving: "Đang lưu...",
    deleting: "Đang xóa...",
    cancel: "Hủy",
    updateError: "Không thể cập nhật bài tập.",
    deleteError: "Không thể xóa bài tập.",
    yourSubmission: "Bài làm của bạn",
    status: "Trạng thái",
    grade: "Điểm",
    feedback: "Nhận xét",
    submit: "Nộp bài",
    unsubmit: "Hủy nộp",
    draftHint: "Tải một tệp lên để tạo bản nháp bài làm.",
    uploadSubmission: "Tải bài làm lên",
    draft: "Bản nháp",
    submitted: "Đã nộp",
    graded: "Đã chấm",
    gradingResult: "Kết quả chấm bài",
    teacherFeedback: "Nhận xét của giảng viên",
    noFeedback: "Giảng viên không để lại nhận xét.",
    gradedAt: "Chấm lúc",
    awaitingGrade: "Bài làm đang chờ chấm. Kết quả trên trang này sẽ tự động cập nhật.",
  },
};

function toLocalDateTimeString(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function ExerciseWorkspace({
  exercise: initialExercise,
  submission: initialSubmission,
  submissions,
  canManage,
}: {
  exercise: ExerciseDto;
  submission?: SubmissionDto;
  submissions: PaginatedResponse<SubmissionDto>;
  canManage: boolean;
}) {
  const router = useRouter();
  const { language } = useLanguage();
  const text = copy[language];
  const [exercise, setExercise] = useState(initialExercise);
  const [submission, setSubmission] = useState(initialSubmission);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit exercise modal state
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(exercise.title);
  const [description, setDescription] = useState(exercise.description ?? "");
  const [dueAt, setDueAt] = useState(toLocalDateTimeString(exercise.dueAt));

  useEffect(() => {
    if (canManage || submission?.status !== "Submitted") return;
    let disposed = false;

    async function refreshSubmission() {
      try {
        const latest = await clientApis.assignments.getMySubmission(exercise.id);
        if (!disposed) setSubmission(latest);
      } catch {
        // Keep the last successfully loaded submission while waiting for grading.
      }
    }

    const timer = window.setInterval(() => void refreshSubmission(), 15_000);
    function refreshWhenVisible() {
      if (document.visibilityState === "visible") void refreshSubmission();
    }
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [canManage, exercise.id, submission?.status]);

  async function downloadAttachment() {
    if (!exercise.attachment) return;
    setBusy(true);
    setError(undefined);
    try {
      const blob = await clientApis.assignments.getAttachment(exercise.id, true);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = exercise.attachment.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.downloadError);
    } finally {
      setBusy(false);
    }
  }

  async function uploadAttachment(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size >= 20_000_000) {
      setError(text.tooLarge);
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      setExercise(await clientApis.assignments.uploadAttachment(exercise.id, file));
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.uploadError);
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File) {
    if (file.size >= 20_000_000) {
      setError(text.tooLarge);
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      setSubmission(await clientApis.assignments.uploadSubmission(exercise.id, file));
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.submissionUploadError);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!submission) return;
    setBusy(true);
    setError(undefined);
    try {
      setSubmission(await clientApis.assignments.submit(submission.id));
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.submitError);
    } finally {
      setBusy(false);
    }
  }

  async function unsubmit() {
    if (!submission) return;
    setBusy(true);
    setError(undefined);
    try {
      setSubmission(await clientApis.assignments.unsubmit(submission.id));
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.unsubmitError);
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(action: "publish" | "close") {
    setBusy(true);
    setError(undefined);
    try {
      setExercise(await clientApis.assignments[action](exercise.id));
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.statusError);
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveExercise(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      const updated = await clientApis.assignments.updateExercise(exercise.id, {
        title: title.trim(),
        description: description.trim() || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      });
      setExercise(updated);
      setEditing(false);
      router.refresh();
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.updateError);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteExercise() {
    if (!window.confirm(text.deleteConfirm)) return;
    setDeleting(true);
    setError(undefined);
    try {
      await clientApis.assignments.removeExercise(exercise.id);
      router.push(`/courses/${exercise.courseId}`);
      router.refresh();
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.deleteError);
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      {error ? (
        <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>
      ) : null}

      {/* Teacher / Admin Action bar */}
      {canManage ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap gap-2">
            {exercise.status === "Draft" ? (
              <button
                type="button"
                onClick={() => changeStatus("publish")}
                disabled={busy}
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {text.publish}
              </button>
            ) : null}
            {exercise.status === "Published" ? (
              <button
                type="button"
                onClick={() => changeStatus("close")}
                disabled={busy}
                className="border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
              >
                {text.close}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setTitle(exercise.title);
                setDescription(exercise.description ?? "");
                setDueAt(toLocalDateTimeString(exercise.dueAt));
                setError(undefined);
                setEditing(true);
              }}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium hover:bg-muted"
            >
              <Pencil className="size-4" />
              {text.editExercise}
            </button>
          </div>
          <button
            type="button"
            onClick={handleDeleteExercise}
            disabled={deleting || busy}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-destructive/30 px-3.5 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            {deleting ? text.deleting : text.deleteExercise}
          </button>
        </div>
      ) : null}

      <div className={canManage ? "space-y-6" : "grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] xl:items-start"}>
      {/* Attachment Section */}
      <section className="min-w-0 space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">{text.title}</h2>
            {exercise.attachment ? (
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Paperclip className="size-4 shrink-0 text-primary" />
                <span className="wrap-break-word">{exercise.attachment.fileName}</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">{text.empty}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {exercise.attachment ? (
              <button
                type="button"
                onClick={downloadAttachment}
                disabled={busy}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >
                <Download className="size-4" />
                {busy ? text.working : text.download}
              </button>
            ) : null}
            {canManage ? (
              <label className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
                <input type="file" className="sr-only" disabled={busy} onChange={uploadAttachment} />
                {exercise.attachment ? text.replace : text.upload}
              </label>
            ) : null}
          </div>
        </div>
      </section>

      {/* Student Submission Workspace */}
      {!canManage ? (
        <section className="min-w-0 space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">{text.yourSubmission}</h2>
          {submission ? (
            <div className="space-y-3">
              <p className="inline-flex min-h-8 items-center rounded-full border border-border bg-muted/50 px-3 text-xs font-medium text-muted-foreground">
                {text.status}:{" "}
                {submission.status === "Draft"
                  ? text.draft
                  : submission.status === "Submitted"
                    ? text.submitted
                    : text.graded}
              </p>
              {submission.status === "Submitted" ? (
                <p className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                  {text.awaitingGrade}
                </p>
              ) : null}
              {submission.status === "Graded" && submission.grade !== null ? (
                <section className="overflow-hidden rounded-xl border border-primary/25 bg-primary/5">
                  <div className="flex flex-col gap-4 border-b border-primary/15 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CheckCircle2 className="size-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold">{text.gradingResult}</h3>
                        {submission.gradedAt ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {text.gradedAt}: {new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(submission.gradedAt))}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-3xl font-bold tracking-tight text-primary">
                      {submission.grade}<span className="text-base font-medium text-muted-foreground">/10</span>
                    </p>
                  </div>
                  <div className="p-5">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <MessageSquareText className="size-4 text-primary" />
                      {text.teacherFeedback}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {submission.feedback || text.noFeedback}
                    </p>
                  </div>
                </section>
              ) : null}
              <div className="flex flex-wrap gap-3">
                {submission.status === "Draft" ? (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={busy}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {text.submit}
                  </button>
                ) : null}
                {submission.status === "Submitted" &&
                (!exercise.dueAt || new Date(exercise.dueAt) > new Date()) ? (
                  <button
                    type="button"
                    onClick={unsubmit}
                    disabled={busy}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                  >
                    {text.unsubmit}
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{text.draftHint}</p>
          )}
          <label className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
            <input
              type="file"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void upload(file);
              }}
              disabled={busy || exercise.status !== "Published"}
            />
            {busy ? text.working : text.uploadSubmission}
          </label>
        </section>
      ) : null}
      </div>

      {/* Submissions queue (Teacher/Admin) */}
      {canManage ? <AssignmentSubmissions exerciseId={exercise.id} initial={submissions} /> : null}

      {/* Edit Exercise Dialog */}
      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(false);
          }}
        >
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-[3px]" />
          <form
            onSubmit={handleSaveExercise}
            role="dialog"
            aria-modal="true"
            className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{text.editTitle}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{text.editDescription}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="grid gap-1.5 text-xs font-medium">
                {text.exerciseTitle}
                <input
                  required
                  maxLength={200}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-10 border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-medium">
                {text.exerciseDescription}
                <textarea
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-medium">
                {text.dueAt}
                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(event) => setDueAt(event.target.value)}
                  className="h-10 border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="border border-border px-4 py-2 text-xs font-medium hover:bg-muted"
              >
                {text.cancel}
              </button>
              <button
                type="submit"
                disabled={busy}
                className="bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {busy ? text.saving : text.saveChanges}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
