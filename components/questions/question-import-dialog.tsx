"use client";

import { useRef, useState } from "react";
import { Download, FileSpreadsheet, X } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";
import { downloadQuestionsTemplate, MAX_IMPORT_ROWS, parseQuestionsWorkbook, type ImportErrorCode, type ImportRow } from "@/lib/questions-excel";
import type { QuestionDto } from "@/types/api";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const copy = {
  en: {
    title: "Import from Excel",
    desc: "Upload an .xlsx file to add many questions to this bank.",
    template: "Download template",
    choose: "Choose .xlsx file",
    readError: "Unable to read this file. Use a valid .xlsx file.",
    tooLarge: "File is larger than 5 MB.",
    empty: "No questions found in the file.",
    limit: `Only the first ${MAX_IMPORT_ROWS} rows are read.`,
    valid: (n: number) => `${n} valid`,
    invalid: (n: number) => `${n} with errors`,
    row: "Row",
    importBtn: (n: number) => `Import ${n} questions`,
    importing: (done: number, total: number) => `Importing ${done}/${total}...`,
    done: (ok: number, fail: number) => `Imported ${ok} questions${fail ? `, ${fail} failed` : ""}.`,
    close: "Close",
    failed: "Failed to save",
    mcq: "Multiple choice",
    fib: "Fill in blank",
    errors: {
      type: "Type must be MCQ or FIB",
      content: "Content is required",
      difficulty: "Difficulty must be Easy, Medium or Hard",
      optionsMin: "At least 2 options are required",
      optionContent: "Options must be filled without gaps",
      correct: "CorrectOption must be a valid option number",
      answers: "Answers are required without gaps",
      answerLength: "An answer exceeds 1000 characters",
    } satisfies Record<ImportErrorCode, string>,
  },
  vi: {
    title: "Nhập từ Excel",
    desc: "Tải lên file .xlsx để thêm nhiều câu hỏi vào ngân hàng này.",
    template: "Tải file mẫu",
    choose: "Chọn file .xlsx",
    readError: "Không đọc được file. Hãy dùng file .xlsx hợp lệ.",
    tooLarge: "File lớn hơn 5 MB.",
    empty: "Không tìm thấy câu hỏi nào trong file.",
    limit: `Chỉ đọc ${MAX_IMPORT_ROWS} dòng đầu tiên.`,
    valid: (n: number) => `${n} hợp lệ`,
    invalid: (n: number) => `${n} có lỗi`,
    row: "Dòng",
    importBtn: (n: number) => `Nhập ${n} câu hỏi`,
    importing: (done: number, total: number) => `Đang nhập ${done}/${total}...`,
    done: (ok: number, fail: number) => `Đã nhập ${ok} câu hỏi${fail ? `, ${fail} dòng thất bại` : ""}.`,
    close: "Đóng",
    failed: "Lưu thất bại",
    mcq: "Trắc nghiệm",
    fib: "Điền chỗ trống",
    errors: {
      type: "Type phải là MCQ hoặc FIB",
      content: "Thiếu nội dung câu hỏi",
      difficulty: "Difficulty phải là Easy, Medium hoặc Hard",
      optionsMin: "Cần ít nhất 2 phương án",
      optionContent: "Các phương án phải điền liên tục, không bỏ trống",
      correct: "CorrectOption phải là số thứ tự phương án hợp lệ",
      answers: "Cần điền đáp án liên tục, không bỏ trống",
      answerLength: "Có đáp án dài hơn 1000 ký tự",
    } satisfies Record<ImportErrorCode, string>,
  },
};

export function QuestionImportDialog({
  bankId,
  bankName,
  onImported,
  onClose,
}: {
  bankId: string;
  bankName: string;
  onImported: (questions: QuestionDto[]) => void;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const text = copy[language];
  const input = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImportRow[]>();
  const [error, setError] = useState<string>();
  const [progress, setProgress] = useState<number>();
  const [failures, setFailures] = useState<Map<number, string>>(new Map());
  const [result, setResult] = useState<{ ok: number; fail: number }>();

  const validRows = rows?.filter((row) => row.payload) ?? [];
  const invalidCount = (rows?.length ?? 0) - validRows.length;
  const busy = progress !== undefined;

  async function onFile(file?: File) {
    setError(undefined);
    setRows(undefined);
    setResult(undefined);
    setFailures(new Map());
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) return setError(text.tooLarge);
    try {
      const parsed = await parseQuestionsWorkbook(await file.arrayBuffer());
      if (!parsed.length) return setError(text.empty);
      setRows(parsed);
    } catch {
      setError(text.readError);
    }
  }

  async function runImport() {
    const created: QuestionDto[] = [];
    const failed = new Map<number, string>();
    setProgress(0);
    for (const [index, row] of validRows.entries()) {
      try {
        created.push(
          row.kind === "MultipleChoice"
            ? await clientApis.questions.createMultipleChoice(bankId, row.payload!)
            : await clientApis.questions.createFillInBlank(bankId, row.payload!),
        );
      } catch (caught) {
        failed.set(row.row, language === "en" && caught instanceof ApiError ? caught.detail : text.failed);
      }
      setProgress(index + 1);
    }
    if (created.length) onImported(created);
    setFailures(failed);
    setResult({ ok: created.length, fail: failed.size });
    setRows((current) => current?.filter((row) => failed.has(row.row) || !row.payload));
    setProgress(undefined);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} disabled={busy} aria-label={text.close} />
      <div className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-2xl space-y-4 overflow-y-auto border border-border bg-card p-5 shadow-2xl sm:p-6">
        <div className="flex justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{text.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{bankName} · {text.desc}</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label={text.close}><X className="size-5" /></button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => void downloadQuestionsTemplate()} className="inline-flex items-center justify-center gap-2 border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
            <Download className="size-4" /> {text.template}
          </button>
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className="inline-flex items-center justify-center gap-2 bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <FileSpreadsheet className="size-4" /> {text.choose}
          </button>
          <input
            ref={input}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(event) => {
              void onFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {result ? <p className="text-sm font-medium text-emerald-700">{text.done(result.ok, result.fail)}</p> : null}

        {rows?.length ? (
          <>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="font-medium text-emerald-700">{text.valid(validRows.length)}</span>
              {invalidCount ? <span className="font-medium text-destructive">{text.invalid(invalidCount)}</span> : null}
              {rows.length >= MAX_IMPORT_ROWS ? <span className="text-muted-foreground">{text.limit}</span> : null}
            </div>
            <ul className="max-h-72 divide-y divide-border overflow-y-auto border border-border text-sm">
              {rows.map((row) => {
                const failure = failures.get(row.row);
                const messages = failure ? [failure] : row.errors.map((code) => text.errors[code]);
                return (
                  <li key={row.row} className="flex gap-3 p-3">
                    <span className="w-16 shrink-0 text-xs text-muted-foreground">{text.row} {row.row}</span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 break-words">{row.content || "—"}</p>
                      <p className="text-xs text-muted-foreground">{row.kind === "MultipleChoice" ? text.mcq : row.kind === "FillInBlank" ? text.fib : ""}</p>
                      {messages.length ? <p className="mt-1 text-xs text-destructive">{messages.join("; ")}</p> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        <button
          type="button"
          onClick={() => void runImport()}
          disabled={busy || !validRows.length}
          className="h-10 w-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? text.importing(progress, validRows.length) : text.importBtn(validRows.length)}
        </button>
      </div>
    </div>
  );
}
