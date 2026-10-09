"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ExaminationQuestionSelector, type ExaminationQuestionSelection } from "@/components/examinations/examination-question-selector";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";
import type { ExaminationDto, QuestionBankDto } from "@/types/api";

const copy = {
  en: {
    title: "Exam questions",
    description: "Change the questions included in this draft. Saving replaces the entire question set.",
    randomNote: "Saving Random selection draws and snapshots a new set now; it does not reroll for each student.",
    loading: "Loading question banks...",
    loadError: "Unable to load question banks.",
    retry: "Retry",
    noBanks: "No question banks are available for this course teacher.",
    save: "Save question changes",
    saving: "Saving...",
    error: "Unable to update the draft question set.",
    saved: "Question set updated.",
  },
  vi: {
    title: "Câu hỏi bài thi",
    description: "Thay đổi các câu hỏi trong bản nháp. Khi lưu, toàn bộ danh sách câu hỏi hiện tại sẽ được thay thế.",
    randomNote: "Lưu chế độ ngẫu nhiên sẽ chọn và chụp một bộ câu hỏi mới ngay lúc này; không chọn lại cho từng học viên.",
    loading: "Đang tải ngân hàng câu hỏi...",
    loadError: "Không thể tải ngân hàng câu hỏi.",
    retry: "Thử lại",
    noBanks: "Giảng viên phụ trách khóa học chưa có ngân hàng câu hỏi.",
    save: "Lưu thay đổi câu hỏi",
    saving: "Đang lưu...",
    error: "Không thể cập nhật danh sách câu hỏi của bản nháp.",
    saved: "Đã cập nhật danh sách câu hỏi.",
  },
};

export function DraftQuestionSetEditor({
  examination,
  teacherId,
}: {
  examination: ExaminationDto;
  teacherId: string;
}) {
  const { language } = useLanguage();
  const router = useRouter();
  const text = copy[language];
  const [banks, setBanks] = useState<QuestionBankDto[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [bankError, setBankError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [selection, setSelection] = useState<ExaminationQuestionSelection>(() => ({
    mode: examination.selectionMode,
    rules: examination.questionSelectionRules.map(({ questionBankId, difficulty, questionCount }) => ({ questionBankId, difficulty, questionCount })),
    questionIds: [...examination.selectedQuestionIds],
  }));

  const loadBanks = useCallback(async () => {
    setLoadingBanks(true);
    setBankError(false);
    try {
      setBanks(await clientApis.questions.listBanks(teacherId));
    } catch {
      setBankError(true);
    } finally {
      setLoadingBanks(false);
    }
  }, [teacherId]);

  useEffect(() => {
    void Promise.resolve().then(loadBanks);
  }, [loadBanks]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    setNotice(undefined);
    try {
      const updated = await clientApis.examinations.updateQuestionSet(examination.id, {
        selectionMode: selection.mode,
        questionSelectionRules: selection.rules,
        questionIds: selection.questionIds,
      });
      setSelection({
        mode: updated.selectionMode,
        rules: updated.questionSelectionRules.map(({ questionBankId, difficulty, questionCount }) => ({ questionBankId, difficulty, questionCount })),
        questionIds: [...updated.selectedQuestionIds],
      });
      setNotice(text.saved);
      router.refresh();
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.error);
    } finally {
      setBusy(false);
    }
  }

  return <section className="rounded-xl border border-border bg-card p-4 shadow-xs sm:p-6">
    <h2 className="text-base font-semibold">{text.title}</h2>
    <p className="mt-1 text-sm leading-6 text-muted-foreground">{text.description}</p>
    {loadingBanks ? <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{text.loading}</div>
      : bankError ? <div className="mt-5 flex flex-wrap items-center gap-3 text-sm"><p role="alert" className="text-destructive">{text.loadError}</p><button type="button" onClick={() => void loadBanks()} className="font-medium text-primary">{text.retry}</button></div>
        : banks.length === 0 ? <p className="mt-5 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">{text.noBanks}</p>
          : <form onSubmit={save}>
            <ExaminationQuestionSelector banks={banks} value={selection} onChange={setSelection} onError={setError} />
            {selection.mode === "Random" ? <p className="mt-3 text-xs leading-5 text-muted-foreground">{text.randomNote}</p> : null}
            {error ? <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
            {notice ? <p role="status" className="mt-4 text-sm text-primary">{notice}</p> : null}
            <div className="mt-5 flex justify-end">
              <button type="submit" disabled={busy || loadingBanks} className="min-h-10 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? text.saving : text.save}</button>
            </div>
          </form>}
  </section>;
}