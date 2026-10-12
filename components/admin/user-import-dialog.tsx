"use client";

import { useRef, useState } from "react";
import { Download, FileSpreadsheet, X } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";
import { downloadUsersTemplate, MAX_USER_IMPORT_ROWS, parseUsersWorkbook, type UserImportErrorCode, type UserImportRow } from "@/lib/users-excel";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

const copy = {
  en: {
    title: "Import users from Excel",
    desc: "Upload an .xlsx file to create many accounts. Accounts are created one by one.",
    template: "Download template",
    choose: "Choose .xlsx file",
    readError: "Unable to read this file. Use a valid .xlsx file.",
    tooLarge: "File is larger than 2 MB.",
    empty: "No users found in the file.",
    limit: `Only the first ${MAX_USER_IMPORT_ROWS} rows are read.`,
    valid: (n: number) => `${n} valid`,
    invalid: (n: number) => `${n} with errors`,
    row: "Row",
    importBtn: (n: number) => `Create ${n} accounts`,
    importing: (done: number, total: number) => `Creating ${done}/${total}...`,
    done: (ok: number, fail: number) => `Created ${ok} accounts${fail ? `, ${fail} failed` : ""}.`,
    close: "Close",
    failed: "Failed to create",
    errors: {
      email: "Email is missing or invalid",
      fullName: "Full name is required (max 100 characters)",
      password: "Password must be 8-128 characters",
      phone: "Phone cannot exceed 20 characters",
      role: "Role must be Student or Teacher (Admin is for System accounts only)",
      duplicate: "Duplicate email in this file",
    } satisfies Record<UserImportErrorCode, string>,
  },
  vi: {
    title: "Nhập người dùng từ Excel",
    desc: "Tải lên file .xlsx để tạo nhiều tài khoản. Tài khoản được tạo lần lượt từng dòng.",
    template: "Tải file mẫu",
    choose: "Chọn file .xlsx",
    readError: "Không đọc được file. Hãy dùng file .xlsx hợp lệ.",
    tooLarge: "File lớn hơn 2 MB.",
    empty: "Không tìm thấy người dùng nào trong file.",
    limit: `Chỉ đọc ${MAX_USER_IMPORT_ROWS} dòng đầu tiên.`,
    valid: (n: number) => `${n} hợp lệ`,
    invalid: (n: number) => `${n} có lỗi`,
    row: "Dòng",
    importBtn: (n: number) => `Tạo ${n} tài khoản`,
    importing: (done: number, total: number) => `Đang tạo ${done}/${total}...`,
    done: (ok: number, fail: number) => `Đã tạo ${ok} tài khoản${fail ? `, ${fail} dòng thất bại` : ""}.`,
    close: "Đóng",
    failed: "Tạo thất bại",
    errors: {
      email: "Email thiếu hoặc không hợp lệ",
      fullName: "Thiếu họ tên (tối đa 100 ký tự)",
      password: "Mật khẩu phải từ 8 đến 128 ký tự",
      phone: "Số điện thoại tối đa 20 ký tự",
      role: "Role phải là Student hoặc Teacher (Admin chỉ dành cho tài khoản System)",
      duplicate: "Email bị trùng trong file",
    } satisfies Record<UserImportErrorCode, string>,
  },
};

export function UserImportDialog({
  actorRole,
  onImported,
  onClose,
}: {
  actorRole: "Admin" | "System";
  onImported: () => void;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const text = copy[language];
  const input = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<UserImportRow[]>();
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
      const parsed = await parseUsersWorkbook(await file.arrayBuffer(), actorRole);
      if (!parsed.length) return setError(text.empty);
      setRows(parsed);
    } catch {
      setError(text.readError);
    }
  }

  async function runImport() {
    let created = 0;
    const failed = new Map<number, string>();
    setProgress(0);
    for (const [index, row] of validRows.entries()) {
      try {
        await clientApis.users.create(row.payload!);
        created += 1;
      } catch (caught) {
        failed.set(row.row, language === "en" && caught instanceof ApiError ? caught.detail : text.failed);
      }
      setProgress(index + 1);
    }
    if (created) onImported();
    setFailures(failed);
    setResult({ ok: created, fail: failed.size });
    setRows((current) => current?.filter((row) => failed.has(row.row) || !row.payload));
    setProgress(undefined);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} disabled={busy} aria-label={text.close} />
      <div role="dialog" aria-modal="true" className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6">
        <div className="flex justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{text.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{text.desc}</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label={text.close}><X className="size-5" /></button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => void downloadUsersTemplate()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
            <Download className="size-4" /> {text.template}
          </button>
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
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
        {result ? <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{text.done(result.ok, result.fail)}</p> : null}

        {rows?.length ? (
          <>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="font-medium text-emerald-700 dark:text-emerald-400">{text.valid(validRows.length)}</span>
              {invalidCount ? <span className="font-medium text-destructive">{text.invalid(invalidCount)}</span> : null}
              {rows.length >= MAX_USER_IMPORT_ROWS ? <span className="text-muted-foreground">{text.limit}</span> : null}
            </div>
            <ul className="max-h-72 divide-y divide-border overflow-y-auto border border-border text-sm">
              {rows.map((row) => {
                const failure = failures.get(row.row);
                const messages = failure ? [failure] : row.errors.map((code) => text.errors[code]);
                return (
                  <li key={row.row} className="flex gap-3 p-3">
                    <span className="w-16 shrink-0 text-xs text-muted-foreground">{text.row} {row.row}</span>
                    <div className="min-w-0 flex-1">
                      <p className="break-all font-medium">{row.email || "—"}</p>
                      <p className="wrap-break-word text-xs text-muted-foreground">{row.fullName || "—"} · {row.role}</p>
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
          className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? text.importing(progress, validRows.length) : text.importBtn(validRows.length)}
        </button>
      </div>
    </div>
  );
}
