"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";
import type { PaginatedResponse, SubmissionDto } from "@/types/api";

const copy = {
  en: { title: "Submissions", description: "Submitted work from students in this course.", empty: "No submitted work yet.", student: "Student", submitted: "Submitted", graded: "Graded", download: "Download submission", noFile: "No attached file", working: "Working...", grade: "Grade", feedback: "Feedback", save: "Save grade", saveError: "Unable to grade this submission.", downloadError: "Unable to download this submission.", loadError: "Unable to load submissions.", previous: "Previous", next: "Next", page: "Page", of: "of" },
  vi: { title: "Bài nộp", description: "Danh sách bài làm học viên đã nộp trong khóa học.", empty: "Chưa có bài làm nào được nộp.", student: "Học viên", submitted: "Đã nộp", graded: "Đã chấm", download: "Tải bài nộp", noFile: "Không có tệp đính kèm", working: "Đang xử lý...", grade: "Điểm", feedback: "Nhận xét", save: "Lưu điểm", saveError: "Không thể chấm bài nộp này.", downloadError: "Không thể tải bài nộp này.", loadError: "Không thể tải danh sách bài nộp.", previous: "Trước", next: "Sau", page: "Trang", of: "trên" },
};

export function AssignmentSubmissions({ exerciseId, initial }: { exerciseId: string; initial: PaginatedResponse<SubmissionDto> }) {
  const { language } = useLanguage();
  const text = copy[language];
  const [data, setData] = useState(initial);
  const [busyId, setBusyId] = useState<string>();
  const [error, setError] = useState<string>();
  const [grade, setGrade] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const date = (value: string | null) => value ? new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

  async function loadPage(page: number) {
    setBusyId("page"); setError(undefined);
    try { setData(await clientApis.assignments.listSubmissions(exerciseId, { page, pageSize: data.pageSize })); }
    catch (caught) { setError(language === "en" && caught instanceof ApiError ? caught.detail : text.loadError); }
    finally { setBusyId(undefined); }
  }

  async function download(item: SubmissionDto) {
    if (!item.attachment) return;
    setBusyId(item.id); setError(undefined);
    try {
      const blob = await clientApis.assignments.getSubmissionContent(item.id, true);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = item.attachment.fileName; anchor.click(); URL.revokeObjectURL(url);
    } catch (caught) { setError(language === "en" && caught instanceof ApiError ? caught.detail : text.downloadError); }
    finally { setBusyId(undefined); }
  }

  async function saveGrade(item: SubmissionDto) {
    const value = Number(grade[item.id] ?? item.grade);
    if (!Number.isFinite(value)) { setError(text.saveError); return; }
    setBusyId(item.id); setError(undefined);
    try {
      const updated = await clientApis.assignments.grade(item.id, { grade: value, feedback: feedback[item.id] ?? item.feedback ?? null });
      setData((current) => ({ ...current, items: current.items.map((candidate) => candidate.id === updated.id ? { ...updated, student: candidate.student } : candidate) }));
    } catch (caught) { setError(language === "en" && caught instanceof ApiError ? caught.detail : text.saveError); }
    finally { setBusyId(undefined); }
  }

  return <section className="max-w-4xl space-y-4"><div><h2 className="text-lg font-semibold">{text.title}</h2><p className="mt-1 text-sm text-muted-foreground">{text.description}</p></div>{error ? <p role="alert" className="border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}{!data.items.length ? <p className="border border-dashed border-border p-5 text-sm text-muted-foreground">{text.empty}</p> : <div className="divide-y divide-border border-y border-border">{data.items.map((item) => <article key={item.id} className="space-y-4 py-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="font-medium">{item.student?.fullName ?? text.student}</p><p className="truncate text-sm text-muted-foreground">{item.student?.email ?? item.studentId}</p><p className="mt-1 text-xs text-muted-foreground">{item.status === "Graded" ? text.graded : text.submitted} · {date(item.submittedAt)}</p></div>{item.attachment ? <button type="button" onClick={() => download(item)} disabled={busyId === item.id} className="inline-flex shrink-0 items-center gap-2 border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"><Download className="size-4" />{busyId === item.id ? text.working : text.download}</button> : <span className="text-sm text-muted-foreground">{text.noFile}</span>}</div><div className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)_auto]"><label className="grid gap-1 text-xs text-muted-foreground">{text.grade}<input aria-label={text.grade} type="number" min="0" max="10" step="0.1" value={grade[item.id] ?? item.grade ?? ""} onChange={(event) => setGrade((current) => ({ ...current, [item.id]: event.target.value }))} className="h-10 border border-input bg-background px-3 text-sm text-foreground" /></label><label className="grid gap-1 text-xs text-muted-foreground">{text.feedback}<input aria-label={text.feedback} value={feedback[item.id] ?? item.feedback ?? ""} onChange={(event) => setFeedback((current) => ({ ...current, [item.id]: event.target.value }))} className="h-10 border border-input bg-background px-3 text-sm text-foreground" /></label><button type="button" onClick={() => saveGrade(item)} disabled={Boolean(busyId)} className="h-10 self-end border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-50">{text.save}</button></div></article>)}</div>}{data.totalPages > 1 ? <div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{text.page} {data.page} {text.of} {data.totalPages}</span><div className="flex gap-2"><button type="button" disabled={Boolean(busyId) || data.page <= 1} onClick={() => loadPage(data.page - 1)} className="inline-flex items-center gap-1 border border-border px-3 py-2 text-sm disabled:opacity-40"><ChevronLeft className="size-4" />{text.previous}</button><button type="button" disabled={Boolean(busyId) || data.page >= data.totalPages} onClick={() => loadPage(data.page + 1)} className="inline-flex items-center gap-1 border border-border px-3 py-2 text-sm disabled:opacity-40">{text.next}<ChevronRight className="size-4" /></button></div></div> : null}</section>;
}
