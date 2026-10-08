"use client";

import { useState } from "react";
import { Download, Paperclip } from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import type { ExerciseDto, PaginatedResponse, SubmissionDto } from "@/types/api";
import { useLanguage } from "@/lib/i18n";
import { AssignmentSubmissions } from "@/components/courses/assignment-submissions";

const copy = {
  en: { title: "Assignment attachment", empty: "No instruction file is attached.", upload: "Upload attachment", replace: "Replace attachment", download: "Download", working: "Working...", tooLarge: "The file must be 20 MB or smaller.", uploadError: "Unable to upload the assignment attachment.", downloadError: "Unable to download the assignment attachment.", submissionUploadError: "Unable to upload submission.", submitError: "Unable to submit this assignment.", unsubmitError: "Unable to reopen this assignment.", statusError: "Unable to update assignment status.", numericGrade: "Enter a numeric grade.", gradeError: "Unable to grade this submission.", publish: "Publish assignment", close: "Close assignment", yourSubmission: "Your submission", status: "Status", grade: "Grade", feedback: "Feedback", submit: "Submit assignment", unsubmit: "Unsubmit", draftHint: "Upload a file to create your draft submission.", uploadSubmission: "Upload submission", submissions: "Submissions", noSubmissions: "No submitted work yet.", student: "Student", saveGrade: "Save grade", draft: "Draft", submitted: "Submitted", graded: "Graded" },
  vi: { title: "Tệp đính kèm bài tập", empty: "Chưa có tệp hướng dẫn đính kèm.", upload: "Tải tệp lên", replace: "Thay tệp đính kèm", download: "Tải xuống", working: "Đang xử lý...", tooLarge: "Tệp không được vượt quá 20 MB.", uploadError: "Không thể tải tệp đính kèm của bài tập lên.", downloadError: "Không thể tải tệp đính kèm của bài tập xuống.", submissionUploadError: "Không thể tải bài làm lên.", submitError: "Không thể nộp bài tập này.", unsubmitError: "Không thể mở lại bài tập này.", statusError: "Không thể cập nhật trạng thái bài tập.", numericGrade: "Hãy nhập điểm bằng số.", gradeError: "Không thể chấm bài làm này.", publish: "Công bố bài tập", close: "Đóng bài tập", yourSubmission: "Bài làm của bạn", status: "Trạng thái", grade: "Điểm", feedback: "Nhận xét", submit: "Nộp bài", unsubmit: "Hủy nộp", draftHint: "Tải một tệp lên để tạo bản nháp bài làm.", uploadSubmission: "Tải bài làm lên", submissions: "Danh sách bài làm", noSubmissions: "Chưa có bài làm nào được nộp.", student: "Học viên", saveGrade: "Lưu điểm", draft: "Bản nháp", submitted: "Đã nộp", graded: "Đã chấm" },
};

export function ExerciseWorkspace({ exercise: initialExercise, submission: initialSubmission, submissions, canManage }: { exercise: ExerciseDto; submission?: SubmissionDto; submissions: PaginatedResponse<SubmissionDto>; canManage: boolean }) {
  const { language } = useLanguage();
  const text = copy[language];
  const [exercise, setExercise] = useState(initialExercise);
  const [submission, setSubmission] = useState(initialSubmission);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function downloadAttachment() {
    if (!exercise.attachment) return;
    setBusy(true); setError(undefined);
    try {
      const blob = await clientApis.assignments.getAttachment(exercise.id, true);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = exercise.attachment.fileName; anchor.click(); URL.revokeObjectURL(url);
    } catch (caught) { setError(language === "en" && caught instanceof ApiError ? caught.detail : text.downloadError); }
    finally { setBusy(false); }
  }

  async function uploadAttachment(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    if (file.size >= 20_000_000) { setError(text.tooLarge); return; }
    setBusy(true); setError(undefined);
    try { setExercise(await clientApis.assignments.uploadAttachment(exercise.id, file)); }
    catch (caught) { setError(language === "en" && caught instanceof ApiError ? caught.detail : text.uploadError); }
    finally { setBusy(false); }
  }

  async function upload(file: File) {
    if (file.size >= 20_000_000) { setError(text.tooLarge); return; }
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

  return <div className="space-y-8">
    {error ? <p className="border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">{error}</p> : null}
    <section className="max-w-3xl space-y-3 border-y border-border py-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">{text.title}</h2>{exercise.attachment ? <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Paperclip className="size-4" />{exercise.attachment.fileName}</p> : <p className="mt-1 text-sm text-muted-foreground">{text.empty}</p>}</div><div className="flex flex-wrap gap-2">{exercise.attachment ? <button type="button" onClick={downloadAttachment} disabled={busy} className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm font-medium disabled:opacity-50"><Download className="size-4" />{busy ? text.working : text.download}</button> : null}{canManage ? <label className="cursor-pointer border border-border px-3 py-2 text-sm font-medium hover:bg-muted"><input type="file" className="sr-only" disabled={busy} onChange={uploadAttachment} />{exercise.attachment ? text.replace : text.upload}</label> : null}</div></div></section>
    {canManage ? <div className="flex flex-wrap gap-3">{exercise.status === "Draft" ? <button type="button" onClick={() => changeStatus("publish")} disabled={busy} className="border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">{text.publish}</button> : null}{exercise.status === "Published" ? <button type="button" onClick={() => changeStatus("close")} disabled={busy} className="border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">{text.close}</button> : null}</div> : <div className="max-w-2xl space-y-4 border-y border-border py-5"><h2 className="font-semibold">{text.yourSubmission}</h2>{submission ? <div className="space-y-3"><p className="text-sm text-muted-foreground">{text.status}: {submission.status === "Draft" ? text.draft : submission.status === "Submitted" ? text.submitted : text.graded}{submission.grade !== null ? ` · ${text.grade}: ${submission.grade}/10` : ""}</p>{submission.feedback ? <p className="text-sm text-muted-foreground">{text.feedback}: {submission.feedback}</p> : null}<div className="flex flex-wrap gap-3">{submission.status === "Draft" ? <button type="button" onClick={submit} disabled={busy} className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{text.submit}</button> : null}{submission.status === "Submitted" && (!exercise.dueAt || new Date(exercise.dueAt) > new Date()) ? <button type="button" onClick={unsubmit} disabled={busy} className="border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">{text.unsubmit}</button> : null}</div></div> : <p className="text-sm text-muted-foreground">{text.draftHint}</p>}<label className="inline-flex cursor-pointer border border-border px-4 py-2 text-sm font-medium hover:bg-muted"><input type="file" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload(file); }} disabled={busy || exercise.status !== "Published"} />{busy ? text.working : text.uploadSubmission}</label></div>}
    {canManage ? <AssignmentSubmissions exerciseId={exercise.id} initial={submissions} /> : null}
  </div>;
}
