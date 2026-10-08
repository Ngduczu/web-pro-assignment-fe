"use client";

import { useMemo, useState } from "react";
import { CirclePlus, Pencil, Trash2, X } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import type { QuestionBankDto, QuestionDifficulty, QuestionDto, QuestionType, UserProfileDto } from "@/types/api";
import { QuestionBankSidebar } from "@/components/questions/question-bank-sidebar";
import { QuestionCard } from "@/components/questions/question-card";

type BankWithQuestions = { bank: QuestionBankDto; questions: QuestionDto[] };

const inputClass = "h-10 w-full border border-input bg-background px-3 text-sm";
const areaClass = "w-full border border-input bg-background px-3 py-2 text-sm";

export function QuestionBankWorkspace({ initialItems, userId, role, teachers }: { initialItems: BankWithQuestions[]; userId: string; role: "Teacher" | "Admin"; teachers: UserProfileDto[] }) {
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState(initialItems[0]?.bank.id ?? "");
  const [bankModal, setBankModal] = useState(false);
  const [questionModal, setQuestionModal] = useState(false);
  const [editingBank, setEditingBank] = useState<QuestionBankDto>();
  const [editingQuestion, setEditingQuestion] = useState<QuestionDto>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [bankName, setBankName] = useState("");
  const [bankDescription, setBankDescription] = useState("");
  const [teacherId, setTeacherId] = useState(userId);
  const [type, setType] = useState<QuestionType>("MultipleChoice");
  const [content, setContent] = useState("");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("Medium");
  const [shuffle, setShuffle] = useState(true);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [answers, setAnswers] = useState([""]);
  const selected = useMemo(() => items.find((item) => item.bank.id === selectedId), [items, selectedId]);

  function openBank(bank?: QuestionBankDto) {
    setEditingBank(bank); setBankName(bank?.name ?? ""); setBankDescription(bank?.description ?? ""); setTeacherId(bank?.teacherId ?? userId); setError(undefined); setBankModal(true);
  }
  function openQuestion(question?: QuestionDto) {
    setEditingQuestion(question); setType(question?.type ?? "MultipleChoice"); setContent(question?.content ?? ""); setDifficulty(question?.difficulty ?? "Medium"); setShuffle(question?.shuffleOptions ?? true);
    setOptions(question?.options.length ? question.options.map((option) => option.content) : ["", "", "", ""]); setCorrectIndex(Math.max(0, question?.options.findIndex((option) => option.isCorrect) ?? 0));
    setAnswers(question?.answers.length ? question.answers.sort((a, b) => a.blankOrder - b.blankOrder).map((answer) => answer.expectedAnswer) : [""]); setError(undefined); setQuestionModal(true);
  }
  function message(caught: unknown, fallback: string) { return caught instanceof ApiError ? caught.detail : fallback; }

  async function saveBank(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(undefined);
    try {
      const bank = editingBank
        ? await clientApis.questions.updateBank(editingBank.id, { name: bankName, description: bankDescription || null })
        : await clientApis.questions.createBank({ teacherId, name: bankName, description: bankDescription || null });
      setItems((current) => editingBank ? current.map((item) => item.bank.id === bank.id ? { ...item, bank } : item) : [...current, { bank, questions: [] }]);
      setSelectedId(bank.id); setBankModal(false);
    } catch (caught) { setError(message(caught, "Unable to save the question bank.")); } finally { setBusy(false); }
  }
  async function removeBank(bank: QuestionBankDto) {
    if (!confirm(`Delete “${bank.name}” and all of its questions?`)) return;
    setBusy(true); setError(undefined);
    try { await clientApis.questions.removeBank(bank.id); setItems((current) => current.filter((item) => item.bank.id !== bank.id)); setSelectedId((current) => current === bank.id ? "" : current); }
    catch (caught) { setError(message(caught, "Unable to delete the question bank.")); } finally { setBusy(false); }
  }
  async function saveQuestion(event: React.FormEvent) {
    event.preventDefault(); if (!selected) return; setBusy(true); setError(undefined);
    try {
      let question: QuestionDto;
      if (editingQuestion) question = await clientApis.questions.updateQuestion(editingQuestion.id, { content, difficulty });
      else if (type === "MultipleChoice") question = await clientApis.questions.createMultipleChoice(selected.bank.id, { content, difficulty, shuffleOptions: shuffle, options: options.map((value, index) => ({ content: value, isCorrect: index === correctIndex })) });
      else question = await clientApis.questions.createFillInBlank(selected.bank.id, { content, difficulty, answers: answers.map((value, index) => ({ blankOrder: index + 1, expectedAnswer: value })) });
      setItems((current) => current.map((item) => item.bank.id !== selected.bank.id ? item : { ...item, questions: editingQuestion ? item.questions.map((old) => old.id === question.id ? question : old) : [...item.questions, question] }));
      setQuestionModal(false);
    } catch (caught) { setError(message(caught, "Unable to save the question.")); } finally { setBusy(false); }
  }
  async function removeQuestion(question: QuestionDto) {
    if (!confirm("Delete this question?")) return; setBusy(true); setError(undefined);
    try { await clientApis.questions.removeQuestion(question.id); setItems((current) => current.map((item) => ({ ...item, questions: item.questions.filter((candidate) => candidate.id !== question.id) }))); }
    catch (caught) { setError(message(caught, "Unable to delete the question.")); } finally { setBusy(false); }
  }

  return <div className="space-y-6">
    {error ? <div className="border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">{error}</div> : null}
    <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <QuestionBankSidebar items={items} selectedId={selectedId} onSelect={setSelectedId} onCreate={() => openBank()} />
      <main className="min-w-0">{selected ? <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-2xl font-semibold">{selected.bank.name}</h2><p className="mt-1 text-sm text-muted-foreground">{selected.bank.description || "No description provided."}</p></div><div className="flex shrink-0 gap-2"><button onClick={() => openBank(selected.bank)} className="border border-border p-2 hover:bg-muted" aria-label="Edit bank"><Pencil className="size-4" /></button><button onClick={() => removeBank(selected.bank)} disabled={busy} className="border border-destructive/30 p-2 text-destructive hover:bg-destructive/5" aria-label="Delete bank"><Trash2 className="size-4" /></button><button onClick={() => openQuestion()} className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><CirclePlus className="size-4" /> Add question</button></div></div>
        {!selected.questions.length ? <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No questions in this bank yet.</div> : <div className="space-y-3">{selected.questions.map((question, index) => <QuestionCard key={question.id} question={question} index={index} onEdit={() => openQuestion(question)} onDelete={() => removeQuestion(question)} />)}</div>}
      </div> : <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Select or create a question bank.</div>}</main>
    </div>
    {bankModal ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setBankModal(false)} aria-label="Close" /><form onSubmit={saveBank} className="relative w-full max-w-lg space-y-5 border border-border bg-card p-5 shadow-2xl sm:p-6"><div className="flex justify-between"><div><h2 className="text-xl font-semibold">{editingBank ? "Edit question bank" : "New question bank"}</h2><p className="mt-1 text-sm text-muted-foreground">Organize reusable questions for examinations.</p></div><button type="button" onClick={() => setBankModal(false)}><X className="size-5" /></button></div>{role === "Admin" && !editingBank ? <label className="grid gap-2 text-sm font-medium">Teacher<select required value={teacherId} onChange={(event) => setTeacherId(event.target.value)} className={inputClass}><option value="">Select teacher</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>)}</select></label> : null}<label className="grid gap-2 text-sm font-medium">Name<input required maxLength={200} value={bankName} onChange={(event) => setBankName(event.target.value)} className={inputClass} /></label><label className="grid gap-2 text-sm font-medium">Description<textarea rows={3} value={bankDescription} onChange={(event) => setBankDescription(event.target.value)} className={areaClass} /></label>{error ? <p className="text-sm text-destructive">{error}</p> : null}<button disabled={busy} className="h-10 w-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Saving..." : "Save question bank"}</button></form></div> : null}
    {questionModal && selected ? <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"><button className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setQuestionModal(false)} aria-label="Close" /><form onSubmit={saveQuestion} className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-2xl space-y-5 overflow-y-auto border border-border bg-card p-5 shadow-2xl sm:p-6"><div className="flex justify-between"><div><h2 className="text-xl font-semibold">{editingQuestion ? "Edit question" : "New question"}</h2><p className="mt-1 text-sm text-muted-foreground">{selected.bank.name}</p></div><button type="button" onClick={() => setQuestionModal(false)}><X className="size-5" /></button></div>{!editingQuestion ? <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setType("MultipleChoice")} className={`border px-3 py-2 text-sm ${type === "MultipleChoice" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>Multiple choice</button><button type="button" onClick={() => setType("FillInBlank")} className={`border px-3 py-2 text-sm ${type === "FillInBlank" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>Fill in blank</button></div> : null}<label className="grid gap-2 text-sm font-medium">Question<textarea required maxLength={4000} rows={4} value={content} onChange={(event) => setContent(event.target.value)} className={areaClass} /></label><label className="grid gap-2 text-sm font-medium">Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value as QuestionDifficulty)} className={inputClass}><option>Easy</option><option>Medium</option><option>Hard</option></select></label>{!editingQuestion && type === "MultipleChoice" ? <fieldset className="space-y-3"><div className="flex items-center justify-between"><legend className="text-sm font-medium">Options</legend><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={shuffle} onChange={(event) => setShuffle(event.target.checked)} /> Shuffle</label></div>{options.map((option, index) => <div key={index} className="flex gap-2"><input type="radio" name="correct" checked={correctIndex === index} onChange={() => setCorrectIndex(index)} aria-label={`Correct option ${index + 1}`} /><input required value={option} onChange={(event) => setOptions((current) => current.map((value, i) => i === index ? event.target.value : value))} placeholder={`Option ${index + 1}`} className={inputClass} /></div>)}</fieldset> : null}{!editingQuestion && type === "FillInBlank" ? <fieldset className="space-y-3"><legend className="text-sm font-medium">Expected answers</legend>{answers.map((answer, index) => <div key={index} className="flex gap-2"><input required value={answer} onChange={(event) => setAnswers((current) => current.map((value, i) => i === index ? event.target.value : value))} placeholder={`Blank ${index + 1}`} className={inputClass} />{answers.length > 1 ? <button type="button" onClick={() => setAnswers((current) => current.filter((_, i) => i !== index))} className="border border-border px-3"><X className="size-4" /></button> : null}</div>)}<button type="button" onClick={() => setAnswers((current) => [...current, ""])} className="text-sm font-medium text-primary">+ Add blank</button></fieldset> : null}{error ? <p className="text-sm text-destructive">{error}</p> : null}<button disabled={busy} className="h-10 w-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Saving..." : "Save question"}</button></form></div> : null}
  </div>;
}
