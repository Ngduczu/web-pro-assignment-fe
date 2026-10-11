"use client";

import { Children, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export const DEFAULT_PAGE_SIZE = 20;

type PaginationControlsProps = {
  page: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
};

export function PaginationControls({ page, totalItems, pageSize = DEFAULT_PAGE_SIZE, onPageChange }: PaginationControlsProps) {
  const { language } = useLanguage();
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);
  const isVi = language === "vi";

  return (
    <nav aria-label={isVi ? "Phân trang danh sách" : "List pagination"} className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {isVi ? `Hiển thị ${firstItem}–${lastItem} / ${totalItems}` : `Showing ${firstItem}–${lastItem} of ${totalItems}`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-45"
          aria-label={isVi ? "Trang trước" : "Previous page"}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {isVi ? "Trước" : "Previous"}
        </button>
        <span aria-live="polite" className="min-w-14 text-center text-sm tabular-nums text-muted-foreground">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-45"
          aria-label={isVi ? "Trang tiếp theo" : "Next page"}
        >
          {isVi ? "Sau" : "Next"}
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

export function PaginatedChildren({
  children,
  listClassName,
  resetKey,
  pageSize = DEFAULT_PAGE_SIZE,
  as = "div",
}: {
  children: ReactNode;
  listClassName: string;
  resetKey?: string | number;
  pageSize?: number;
  as?: "div" | "ol" | "ul";
}) {
  const items = Children.toArray(children);
  const [pagination, setPagination] = useState({ page: 1, resetKey });
  const page = pagination.resetKey === resetKey ? pagination.page : 1;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const List = as;

  return (
    <div className="space-y-4">
      <List className={listClassName}>
        {items.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
      </List>
      <PaginationControls page={currentPage} totalItems={items.length} pageSize={pageSize} onPageChange={(nextPage) => setPagination({ page: nextPage, resetKey })} />
    </div>
  );
}
