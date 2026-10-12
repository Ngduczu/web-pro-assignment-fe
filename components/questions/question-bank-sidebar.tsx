"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CirclePlus, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { QuestionBankDto, QuestionDto } from "@/types/api";
import { PaginatedChildren } from "@/components/ui/paginated-list";

export function QuestionBankSidebar({ items, selectedId, onSelect, onCreate, refreshAction }: { items: { bank: QuestionBankDto; questions: QuestionDto[] }[]; selectedId: string; onSelect: (id: string) => void; onCreate: () => void; refreshAction?: ReactNode }) {
  const { language } = useLanguage();
  const isVi = language === "vi";
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(
    () => (normalized ? items.filter(({ bank }) => bank.name.toLowerCase().includes(normalized)) : items),
    [items, normalized],
  );

  return (
    <aside className="border border-border bg-card lg:sticky lg:top-6 lg:self-start">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="font-semibold">{isVi ? "Ngân hàng câu hỏi" : "Banks"}</h2>
          <p className="text-xs text-muted-foreground">{filtered.length} {isVi ? "ngân hàng" : "total"}</p>
        </div>
        <button onClick={onCreate} className="flex size-9 items-center justify-center bg-primary text-primary-foreground" aria-label={isVi ? "Tạo ngân hàng câu hỏi" : "Create bank"}>
          <CirclePlus className="size-4" />
        </button>
      </div>
      {refreshAction ? <div className="border-b border-border p-2">{refreshAction}</div> : null}
      <div className="border-b border-border p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isVi ? "Tìm tên ngân hàng..." : "Search banks..."}
            aria-label={isVi ? "Tìm tên ngân hàng" : "Search banks"}
            className="h-9 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-2">
        {filtered.length ? (
          <PaginatedChildren listClassName="space-y-1" resetKey={`${items.length}-${normalized}`}>
            {filtered.map(({ bank, questions }) => (
              <button key={bank.id} onClick={() => onSelect(bank.id)} className={`w-full px-3 py-3 text-left text-sm ${selectedId === bank.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                <span className="block truncate font-medium">{bank.name}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{questions.length} {isVi ? "câu hỏi" : "questions"}</span>
              </button>
            ))}
          </PaginatedChildren>
        ) : (
          <p className="p-4 text-sm text-muted-foreground">
            {items.length
              ? isVi ? "Không tìm thấy ngân hàng phù hợp." : "No matching banks."
              : isVi ? "Tạo ngân hàng câu hỏi đầu tiên của bạn." : "Create your first question bank."}
          </p>
        )}
      </div>
    </aside>
  );
}
