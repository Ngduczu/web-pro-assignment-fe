"use client";

import { useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Download, UserRound } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";
import type { ExaminationAttemptResultDto, ExaminationDto, ExaminationSubmitReason, PaginatedResponse } from "@/types/api";

const copy = {
  en: {
    title: "Class attempt history", description: "Review each participant's progress, result and integrity signals.",
    student: "Student", status: "Status", action: "Action", started: "Started", submitted: "Submitted", result: "Result", violations: "Violations", noAttempts: "No students have attempted this examination yet.",
    active: "In progress", pending: "Pending release", previous: "Previous", next: "Next", page: "Page", of: "of",
    loadError: "Unable to load examination results.", reconcile: "Auto-submit", reconciling: "Submitting...",
    reconcileConfirm: "Auto-submit this expired attempt?", reconcileError: "Unable to auto-submit this attempt.",
    exportResults: "Export results", exportingResults: "Preparing XLSX...", exportError: "Unable to export examination results.",
  },
  vi: {
    title: "Lịch sử làm bài của lớp", description: "Theo dõi tiến độ, kết quả và tín hiệu vi phạm của từng học viên.",
    student: "Học viên", status: "Trạng thái", action: "Thao tác", started: "Bắt đầu", submitted: "Nộp bài", result: "Kết quả", violations: "Vi phạm", noAttempts: "Chưa có học viên nào làm kỳ thi này.",
    active: "Đang làm", pending: "Chờ công bố", previous: "Trước", next: "Sau", page: "Trang", of: "trên",
    loadError: "Không thể tải kết quả kỳ thi.", reconcile: "Tự động nộp", reconciling: "Đang nộp...",
    reconcileConfirm: "Tự động nộp lượt thi đã hết điều kiện này?", reconcileError: "Không thể tự động nộp lượt thi này.",
    exportResults: "Xuất kết quả", exportingResults: "Đang tạo tệp XLSX...", exportError: "Không thể xuất kết quả kỳ thi.",
  },
};

const statusVi: Record<string, string> = { InProgress: "Đang làm", Disconnected: "Mất kết nối", Submitted: "Đã nộp", AutoSubmitted: "Tự động nộp" };
const formatDate = (value: string | null, language: "en" | "vi") => value
  ? new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  : "—";

function applicableAutoSubmitReason(item: ExaminationAttemptResultDto, examination: ExaminationDto): ExaminationSubmitReason | undefined {
  if (item.status !== "InProgress" && item.status !== "Disconnected") return undefined;
  if (examination.status === "Closed") return "ExaminationClosed";
  if (examination.security.maxViolations > 0 && item.violationCount >= examination.security.maxViolations) return "MaxViolationsExceeded";
  const deadline = Math.min(new Date(examination.dueAt).getTime(), new Date(item.startedAt).getTime() + examination.durationMinutes * 60_000);
  return Date.now() >= deadline ? "DurationExpired" : undefined;
}

export function ExaminationResults({ examination, initial, canAutoSubmit = false }: { examination: ExaminationDto; initial: PaginatedResponse<ExaminationAttemptResultDto>; canAutoSubmit?: boolean }) {
  const { language } = useLanguage();
  const text = copy[language];
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [busyAttemptId, setBusyAttemptId] = useState<string>();
  const [error, setError] = useState<string>();

  async function go(page: number) {
    setBusy(true); setError(undefined);
    try { setData(await clientApis.examinations.listAttempts(examination.id, { page, pageSize: data.pageSize })); }
    catch (caught) { setError(language === "en" && caught instanceof ApiError ? caught.detail : text.loadError); }
    finally { setBusy(false); }
  }

  async function autoSubmit(item: ExaminationAttemptResultDto, reason: ExaminationSubmitReason) {
    if (!window.confirm(text.reconcileConfirm)) return;
    setBusyAttemptId(item.id); setError(undefined);
    try { await clientApis.examinations.autoSubmit(item.id, reason); await go(data.page); }
    catch (caught) { setError(language === "en" && caught instanceof ApiError ? caught.detail : text.reconcileError); }
    finally { setBusyAttemptId(undefined); }
  }

  async function exportResults() {
    setExporting(true); setError(undefined);
    try {
      const firstPage = await clientApis.examinations.listAttempts(examination.id, { page: 1, pageSize: 100 });
      const items = [...firstPage.items];
      for (let page = 2; page <= firstPage.totalPages; page++) {
        const nextPage = await clientApis.examinations.listAttempts(examination.id, { page, pageSize: 100 });
        items.push(...nextPage.items);
      }

      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(language === "vi" ? "Kết quả" : "Results");
      sheet.columns = [
        { header: text.student, key: "student", width: 28 },
        { header: "Email", key: "email", width: 34 },
        { header: text.status, key: "status", width: 20 },
        { header: text.started, key: "started", width: 22, style: { numFmt: "dd/mm/yyyy hh:mm" } },
        { header: text.submitted, key: "submitted", width: 22, style: { numFmt: "dd/mm/yyyy hh:mm" } },
        { header: text.result, key: "result", width: 28 },
        { header: text.violations, key: "violations", width: 14 },
      ];
      items.forEach((item) => sheet.addRow({
        student: item.studentFullName,
        email: item.studentEmail,
        status: status(item.status),
        started: new Date(item.startedAt),
        submitted: item.submittedAt ? new Date(item.submittedAt) : null,
        result: result(item),
        violations: item.violationCount,
      }));
      sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF15803D" } };
      sheet.views = [{ state: "frozen", ySplit: 1 }];
      sheet.autoFilter = { from: "A1", to: `G${Math.max(items.length + 1, 1)}` };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeTitle = examination.title.replace(/[\\/:*?\"<>|]/g, "-").trim() || "examination";
      link.href = url;
      link.download = `${safeTitle}-results.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError(text.exportError);
    } finally {
      setExporting(false);
    }
  }

  function status(value: string) { return language === "vi" ? statusVi[value] ?? value : value.replace(/([a-z])([A-Z])/g, "$1 $2"); }
  function result(item: ExaminationAttemptResultDto) {
    if (item.status === "InProgress" || item.status === "Disconnected") return text.active;
    if (item.score === null) return text.pending;
    return `${item.score.toFixed(2)}/10 · ${item.correctAnswers ?? 0}/${item.totalQuestions}`;
  }

  return <section className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{text.title}</h2><p className="mt-1 text-sm text-muted-foreground">{text.description}</p></div><button type="button" onClick={exportResults} disabled={exporting || !data.totalCount} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"><Download className="size-4" />{exporting ? text.exportingResults : text.exportResults}</button></div>
    {error ? <p className="border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
    {!data.items.length ? <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">{text.noAttempts}</div> : (
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <table className="w-full min-w-[64rem] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3 font-medium">{text.student}</th><th className="px-4 py-3 font-medium">{text.status}</th><th className="px-4 py-3 font-medium">{text.started}</th><th className="px-4 py-3 font-medium">{text.submitted}</th><th className="px-4 py-3 font-medium">{text.result}</th><th className="px-4 py-3 text-right font-medium">{text.violations}</th>{canAutoSubmit ? <th className="px-4 py-3 text-right font-medium">{text.action}</th> : null}</tr></thead>
          <tbody className="divide-y divide-border">{data.items.map((item) => { const reason = canAutoSubmit ? applicableAutoSubmitReason(item, examination) : undefined; const active = item.status === "InProgress" || item.status === "Disconnected"; return <tr key={item.id} className="hover:bg-muted/20"><td className="px-4 py-4"><div className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><UserRound className="size-4" /></span><div><p className="font-medium">{item.studentFullName}</p><p className="text-xs text-muted-foreground">{item.studentEmail}</p></div></div></td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${active ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>{status(item.status)}</span></td><td className="px-4 py-4 text-muted-foreground">{formatDate(item.startedAt, language)}</td><td className="px-4 py-4 text-muted-foreground">{formatDate(item.submittedAt, language)}</td><td className="px-4 py-4 font-medium">{result(item)}</td><td className={`px-4 py-4 text-right font-medium ${item.violationCount ? "text-destructive" : ""}`}>{item.violationCount}</td>{canAutoSubmit ? <td className="px-4 py-4 text-right">{reason ? <button type="button" disabled={busyAttemptId === item.id} onClick={() => autoSubmit(item, reason)} className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-50"><AlertTriangle className="size-3.5" />{busyAttemptId === item.id ? text.reconciling : text.reconcile}</button> : "—"}</td> : null}</tr>; })}</tbody>
        </table>
      </div>
    )}
    {data.totalPages > 1 ? <div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{text.page} {data.page} {text.of} {data.totalPages}</p><div className="flex gap-2"><button disabled={busy || data.page <= 1} onClick={() => go(data.page - 1)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-40"><ChevronLeft className="size-4" />{text.previous}</button><button disabled={busy || data.page >= data.totalPages} onClick={() => go(data.page + 1)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-40">{text.next}<ChevronRight className="size-4" /></button></div></div> : null}
  </section>;
}
