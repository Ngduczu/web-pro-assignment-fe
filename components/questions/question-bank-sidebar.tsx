"use client";

import { CirclePlus } from "lucide-react";
import type { QuestionBankDto, QuestionDto } from "@/types/api";

export function QuestionBankSidebar({ items, selectedId, onSelect, onCreate }: { items: { bank: QuestionBankDto; questions: QuestionDto[] }[]; selectedId: string; onSelect: (id: string) => void; onCreate: () => void }) {
  return <aside className="border border-border bg-card lg:sticky lg:top-6 lg:self-start"><div className="flex items-center justify-between border-b border-border p-4"><div><h2 className="font-semibold">Banks</h2><p className="text-xs text-muted-foreground">{items.length} total</p></div><button onClick={onCreate} className="flex size-9 items-center justify-center bg-primary text-primary-foreground" aria-label="Create bank"><CirclePlus className="size-4" /></button></div><div className="max-h-[60vh] overflow-y-auto p-2">{items.length ? items.map(({ bank, questions }) => <button key={bank.id} onClick={() => onSelect(bank.id)} className={`mb-1 w-full px-3 py-3 text-left text-sm ${selectedId === bank.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}><span className="block truncate font-medium">{bank.name}</span><span className="mt-1 block text-xs text-muted-foreground">{questions.length} questions</span></button>) : <p className="p-4 text-sm text-muted-foreground">Create your first question bank.</p>}</div></aside>;
}

