"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import { useLanguage } from "@/lib/i18n";
import type { ExaminationQuestionSelectionMode, QuestionBankDto, QuestionDifficulty, QuestionDto, QuestionSelectionRuleInput, QuestionType } from "@/types/api";

export type ExaminationQuestionSelection = {
  mode: ExaminationQuestionSelectionMode;
  rules: QuestionSelectionRuleInput[];
  questionIds: string[];
};

const field = "h-10 w-full border border-input bg-background px-3 text-sm";
const copy = {
  en: { legend: "Question selection", random: "Random selection", randomDescription: "Choose a bank, difficulty, and number of questions.", manual: "Manual selection", manualDescription: "Review and select each question that will appear in the examination.", bank: "Question bank", allBanks: "All question banks", difficulty: "Difficulty", allDifficulties: "All difficulties", type: "Question type", allTypes: "All question types", multipleChoice: "Multiple choice", fillBlank: "Fill in blank", easy: "Easy", medium: "Medium", hard: "Hard", count: "Question count", addRule: "+ Add selection rule", removeRule: "Remove rule", totalRandom: "questions will be selected randomly", selected: "selected", selectVisible: "Select visible", clearSelection: "Clear selection", search: "Search question content", loading: "Loading questions...", loadFailure: "Unable to load questions from the selected banks.", empty: "No questions match these filters." },
  vi: { legend: "Cách chọn câu hỏi", random: "Chọn ngẫu nhiên", randomDescription: "Chọn ngân hàng, độ khó và số lượng câu hỏi.", manual: "Chọn thủ công", manualDescription: "Xem và chọn chính xác từng câu sẽ xuất hiện trong kỳ thi.", bank: "Ngân hàng câu hỏi", allBanks: "Tất cả ngân hàng", difficulty: "Độ khó", allDifficulties: "Mọi độ khó", type: "Loại câu hỏi", allTypes: "Mọi loại câu", multipleChoice: "Trắc nghiệm", fillBlank: "Điền vào chỗ trống", easy: "Dễ", medium: "Trung bình", hard: "Khó", count: "Số câu hỏi", addRule: "+ Thêm quy tắc chọn", removeRule: "Xóa quy tắc", totalRandom: "câu sẽ được chọn ngẫu nhiên", selected: "đã chọn", selectVisible: "Chọn các câu đang hiển thị", clearSelection: "Bỏ chọn tất cả", search: "Tìm trong nội dung câu hỏi", loading: "Đang tải câu hỏi...", loadFailure: "Không thể tải câu hỏi từ các ngân hàng đã chọn.", empty: "Không có câu hỏi phù hợp bộ lọc." },
};

export function ExaminationQuestionSelector({ banks, value, onChange, onError }: { banks: QuestionBankDto[]; value: ExaminationQuestionSelection; onChange: (value: ExaminationQuestionSelection) => void; onError: (message?: string) => void }) {
  const { language } = useLanguage();
  const text = copy[language];
  const [questionsByBank, setQuestionsByBank] = useState<Record<string, QuestionDto[]>>({});
  const [loading, setLoading] = useState(false);
  const [bankFilter, setBankFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | QuestionDifficulty>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | QuestionType>("all");
  const [search, setSearch] = useState("");
  const questions = useMemo(() => banks.flatMap((bank) => (questionsByBank[bank.id] ?? []).map((question) => ({ question, bank }))), [banks, questionsByBank]);
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase(language === "vi" ? "vi" : "en");
    return questions.filter(({ question }) => (bankFilter === "all" || question.questionBankId === bankFilter) && (difficultyFilter === "all" || question.difficulty === difficultyFilter) && (typeFilter === "all" || question.type === typeFilter) && (!term || question.content.toLocaleLowerCase(language === "vi" ? "vi" : "en").includes(term)));
  }, [questions, bankFilter, difficultyFilter, typeFilter, search, language]);
  const selected = useMemo(() => new Set(value.questionIds), [value.questionIds]);
  const total = value.rules.reduce((sum, rule) => sum + Math.max(0, rule.questionCount || 0), 0);

  const loadQuestions = useCallback(async () => {
    if (banks.every((bank) => questionsByBank[bank.id])) return;
    setLoading(true); onError(undefined);
    try {
      const loaded = await Promise.all(banks.map(async (bank) => [bank.id, await clientApis.questions.listQuestions(bank.id)] as const));
      setQuestionsByBank((current) => ({ ...current, ...Object.fromEntries(loaded) }));
    } catch (error) {
      onError(language === "en" && error instanceof ApiError ? error.detail : text.loadFailure);
    } finally { setLoading(false); }
  }, [banks, language, onError, questionsByBank, text.loadFailure]);

  useEffect(() => {
    if (value.mode === "Manual") void Promise.resolve().then(loadQuestions);
  }, [loadQuestions, value.mode]);

  function setMode(mode: ExaminationQuestionSelectionMode) {
    onError(undefined);
    onChange(mode === "Random"
      ? { mode, rules: value.rules.length ? value.rules : [{ questionBankId: "", difficulty: "Medium", questionCount: 1 }], questionIds: [] }
      : { mode, rules: [], questionIds: value.questionIds });
  }

  function toggle(questionId: string) {
    const questionIds = selected.has(questionId) ? value.questionIds.filter((id) => id !== questionId) : [...value.questionIds, questionId].slice(0, 500);
    onChange({ ...value, questionIds });
  }

  const difficultyLabel = (difficulty: QuestionDifficulty) => difficulty === "Easy" ? text.easy : difficulty === "Medium" ? text.medium : text.hard;
  const typeLabel = (type: QuestionType) => type === "MultipleChoice" ? text.multipleChoice : text.fillBlank;

  return <fieldset className="mt-6 space-y-4 border-y border-border py-5">
    <legend className="px-2 text-sm font-semibold">{text.legend}</legend>
    <div className="grid gap-3 sm:grid-cols-2">{(["Random", "Manual"] as const).map((mode) => <button key={mode} type="button" onClick={() => setMode(mode)} aria-pressed={value.mode === mode} className={`border p-4 text-left transition ${value.mode === mode ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/40"}`}><span className="block text-sm font-semibold">{mode === "Random" ? text.random : text.manual}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{mode === "Random" ? text.randomDescription : text.manualDescription}</span></button>)}</div>
    {value.mode === "Random" ? <div className="space-y-3">{value.rules.map((rule, index) => <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_7rem_auto]"><select required value={rule.questionBankId} onChange={(event) => onChange({ ...value, rules: value.rules.map((item, itemIndex) => itemIndex === index ? { ...item, questionBankId: event.target.value } : item) })} className={field}><option value="">{text.bank}</option>{banks.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}</select><select value={rule.difficulty} onChange={(event) => onChange({ ...value, rules: value.rules.map((item, itemIndex) => itemIndex === index ? { ...item, difficulty: event.target.value as QuestionDifficulty } : item) })} className={field}><option value="Easy">{text.easy}</option><option value="Medium">{text.medium}</option><option value="Hard">{text.hard}</option></select><input type="number" min={1} max={500} value={rule.questionCount} onChange={(event) => onChange({ ...value, rules: value.rules.map((item, itemIndex) => itemIndex === index ? { ...item, questionCount: Number(event.target.value) } : item) })} className={field} aria-label={text.count} />{value.rules.length > 1 ? <button type="button" onClick={() => onChange({ ...value, rules: value.rules.filter((_, itemIndex) => itemIndex !== index) })} className="flex h-10 items-center justify-center border border-border px-3" aria-label={text.removeRule}><X className="size-4" /></button> : null}</div>)}<div className="flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={() => onChange({ ...value, rules: [...value.rules, { questionBankId: "", difficulty: "Medium", questionCount: 1 }] })} className="text-sm font-medium text-primary">{text.addRule}</button><span className="text-sm text-muted-foreground"><strong className="text-foreground">{total}</strong> {text.totalRandom}</span></div></div> : <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><label className="relative sm:col-span-2 lg:col-span-1"><span className="sr-only">{text.search}</span><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={text.search} className={`${field} pl-9`} /></label><select aria-label={text.bank} value={bankFilter} onChange={(event) => setBankFilter(event.target.value)} className={field}><option value="all">{text.allBanks}</option>{banks.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}</select><select aria-label={text.difficulty} value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value as "all" | QuestionDifficulty)} className={field}><option value="all">{text.allDifficulties}</option><option value="Easy">{text.easy}</option><option value="Medium">{text.medium}</option><option value="Hard">{text.hard}</option></select><select aria-label={text.type} value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "all" | QuestionType)} className={field}><option value="all">{text.allTypes}</option><option value="MultipleChoice">{text.multipleChoice}</option><option value="FillInBlank">{text.fillBlank}</option></select></div>
      <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm"><strong>{value.questionIds.length}</strong> {text.selected}</span><div className="flex flex-wrap gap-3"><button type="button" onClick={() => onChange({ ...value, questionIds: [...new Set([...value.questionIds, ...filtered.map(({ question }) => question.id)])].slice(0, 500) })} disabled={!filtered.length} className="text-sm font-medium text-primary disabled:opacity-40">{text.selectVisible}</button><button type="button" onClick={() => onChange({ ...value, questionIds: [] })} disabled={!value.questionIds.length} className="text-sm font-medium text-muted-foreground disabled:opacity-40">{text.clearSelection}</button></div></div>
      {loading ? <div className="flex items-center justify-center gap-2 border border-dashed border-border p-8 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{text.loading}</div> : !filtered.length ? <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{text.empty}</div> : <div className="max-h-80 divide-y divide-border overflow-y-auto border-y border-border">{filtered.map(({ question, bank }) => <label key={question.id} className={`flex cursor-pointer items-start gap-3 p-3 transition hover:bg-muted/40 ${selected.has(question.id) ? "bg-primary/5" : ""}`}><input type="checkbox" checked={selected.has(question.id)} onChange={() => toggle(question.id)} className="mt-1 size-4 shrink-0" /><span className="min-w-0 flex-1"><span className="block whitespace-pre-wrap text-sm font-medium">{question.content}</span><span className="mt-1 block text-xs text-muted-foreground">{bank.name} · {difficultyLabel(question.difficulty)} · {typeLabel(question.type)}</span></span></label>)}</div>}
    </div>}
  </fieldset>;
}
