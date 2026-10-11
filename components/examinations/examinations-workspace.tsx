"use client";

import Link from "next/link";
import { useState } from "react";
import { CirclePlus, RotateCcw, Search } from "lucide-react";
import type { CourseDto, ExaminationDto, ExaminationStatus, QuestionBankDto, Role, StudentExaminationDto } from "@/types/api";
import { ExaminationCreateDialog } from "@/components/examinations/examination-create-dialog";
import { useLanguage } from "@/lib/i18n";
import { DEFAULT_PAGE_SIZE, PaginationControls } from "@/components/ui/paginated-list";
import { AreaRefreshButton } from "@/components/ui/area-refresh-button";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";

type ExamItem = { course: CourseDto; examination: ExaminationDto | StudentExaminationDto };

export function ExaminationsWorkspace({ initialItems, courses: initialCourses, banks: initialBanks, role, userId }: { initialItems: ExamItem[]; courses: CourseDto[]; banks: QuestionBankDto[]; role: Role; userId: string }) {
  const { language } = useLanguage();
  const [items, setItems] = useState(initialItems);
  const [courses, setCourses] = useState(initialCourses);
  const [banks, setBanks] = useState(initialBanks);
  const [refreshError, setRefreshError] = useState<string>();
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<ExaminationStatus | "all">("all");
  const [pagination, setPagination] = useState({ page: 1, filterKey: "" });
  const text = language === "vi" ? {
    studentSchedule: "Lịch thi của bạn", assessmentSchedule: "Lịch khảo thí", summary: (visible: number, total: number, courseCount: number, filtered: boolean) => filtered ? `Hiển thị ${visible}/${total} kỳ thi trong ${courseCount} khóa học.` : `${total} kỳ thi trong ${courseCount} khóa học.`, create: "Tạo kỳ thi", needBank: "Hãy tạo ngân hàng câu hỏi trước khi tạo kỳ thi.", openBanks: "Mở ngân hàng câu hỏi", empty: "Chưa có kỳ thi nào.", noMatches: "Không tìm thấy kỳ thi phù hợp.", search: "Tìm theo tên kỳ thi hoặc khóa học", course: "Tất cả khóa học", status: "Tất cả trạng thái", draft: "Bản nháp", published: "Đã công bố", closed: "Đã đóng", examination: "Kỳ thi", schedule: "Lịch thi", duration: "Thời lượng", questions: "Số câu", minutes: "phút", clearFilters: "Xóa bộ lọc", starts: "Bắt đầu", ends: "Kết thúc", refresh: "Làm mới kỳ thi", refreshing: "Đang làm mới...", refreshError: "Không thể làm mới danh sách kỳ thi.",
  } : {
    studentSchedule: "Your examination schedule", assessmentSchedule: "Assessment schedule", summary: (visible: number, total: number, courseCount: number, filtered: boolean) => filtered ? `Showing ${visible} of ${total} examinations across ${courseCount} courses.` : `${total} examination${total === 1 ? "" : "s"} across ${courseCount} course${courseCount === 1 ? "" : "s"}.`, create: "Create examination", needBank: "Create a question bank before creating an examination.", openBanks: "Open question banks", empty: "No examinations are available yet.", noMatches: "No examinations match these filters.", search: "Search examinations or courses", course: "All courses", status: "All statuses", draft: "Draft", published: "Published", closed: "Closed", examination: "Examination", schedule: "Schedule", duration: "Duration", questions: "Questions", minutes: "min", clearFilters: "Clear filters", starts: "Starts", ends: "Ends", refresh: "Refresh examinations", refreshing: "Refreshing...", refreshError: "Unable to refresh examinations.",
  };
  const formatter = new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", { dateStyle: "medium", timeStyle: "short" });
  const statusLabel: Record<ExaminationStatus, string> = { Draft: text.draft, Published: text.published, Closed: text.closed };
  const statusTone: Record<ExaminationStatus, string> = {
    Draft: "bg-muted text-muted-foreground",
    Published: "bg-primary/10 text-primary",
    Closed: "bg-muted text-muted-foreground",
  };
  const locale = language === "vi" ? "vi-VN" : "en-US";
  const normalizedSearch = search.trim().toLocaleLowerCase(locale);
  const sortedItems = [...items]
    .filter(({ course, examination }) => {
      const matchesSearch = !normalizedSearch || `${examination.title} ${course.name}`.toLocaleLowerCase(locale).includes(normalizedSearch);
      return matchesSearch && (courseFilter === "all" || course.id === courseFilter) && (statusFilter === "all" || examination.status === statusFilter);
    })
    .sort((a, b) => new Date(a.examination.startAt).getTime() - new Date(b.examination.startAt).getTime());
  const filtersActive = Boolean(normalizedSearch) || courseFilter !== "all" || statusFilter !== "all";
  const filterKey = `${search}|${courseFilter}|${statusFilter}`;
  const page = pagination.filterKey === filterKey ? pagination.page : 1;
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sortedItems.slice((currentPage - 1) * DEFAULT_PAGE_SIZE, currentPage * DEFAULT_PAGE_SIZE);

  function clearFilters() {
    setSearch("");
    setCourseFilter("all");
    setStatusFilter("all");
  }

  async function refreshExaminations() {
    setRefreshError(undefined);
    try {
      const latestCourses = role === "Student"
        ? await clientApis.courses.listMine()
        : (await clientApis.courses.list({ teacherId: role === "Teacher" ? userId : undefined, pageSize: 20 })).items;
      const latestResults = await Promise.all(latestCourses.map(async (course) => ({
        course,
        examinations: role === "Student"
          ? await clientApis.examinations.listAvailable(course.id)
          : await clientApis.examinations.listByCourse(course.id),
      })));
      const latestItems = latestResults.flatMap((result) => result.examinations.map((examination) => ({ course: result.course, examination })));
      const latestBanks = role === "Student" ? [] : await clientApis.questions.listBanks(role === "Teacher" ? userId : undefined);
      setItems(latestItems);
      setCourses(latestCourses);
      setBanks(latestBanks);
      setPagination({ page: 1, filterKey: "" });
    } catch (caught) {
      setRefreshError(language === "en" && caught instanceof ApiError ? caught.detail : text.refreshError);
    }
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold">{role === "Student" ? text.studentSchedule : text.assessmentSchedule}</h2><p className="mt-1 text-sm text-muted-foreground">{text.summary(sortedItems.length, items.length, courses.length, filtersActive)}</p></div><div className="flex flex-wrap gap-2"><AreaRefreshButton label={text.refresh} loadingLabel={text.refreshing} onRefresh={refreshExaminations} />{role !== "Student" && role !== "Admin" && role !== "System" ? <button type="button" disabled={!courses.length || !banks.length} onClick={() => setCreating(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"><CirclePlus className="size-4" />{text.create}</button> : null}</div></div>
    {refreshError ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{refreshError}</p> : null}
    {role !== "Student" && role !== "Admin" && role !== "System" && !banks.length ? <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700">{text.needBank} <Link href="/question-banks" className="font-medium underline">{text.openBanks}</Link></div> : null}
    {items.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1fr)_14rem_12rem_auto]">
      <label className="relative block sm:col-span-2 xl:col-span-1"><span className="sr-only">{text.search}</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={text.search} className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring/40" /></label>
      <label><span className="sr-only">{text.course}</span><select aria-label={text.course} value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="all">{text.course}</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
      <label><span className="sr-only">{text.status}</span><select aria-label={text.status} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ExaminationStatus | "all")} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="all">{text.status}</option>{role !== "Student" ? <option value="Draft">{text.draft}</option> : null}<option value="Published">{text.published}</option><option value="Closed">{text.closed}</option></select></label>
      {filtersActive ? <button type="button" onClick={clearFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"><RotateCcw className="size-4" />{text.clearFilters}</button> : null}
    </div> : null}
    {!items.length ? <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{text.empty}</div> : !sortedItems.length ? <div className="rounded-xl border border-dashed border-border p-8 text-center"><p className="text-sm text-muted-foreground">{text.noMatches}</p><button type="button" onClick={clearFilters} className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 px-3 text-sm font-medium text-primary hover:underline"><RotateCcw className="size-4" />{text.clearFilters}</button></div> : <>
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card lg:block">
        <table className="w-full min-w-4xl text-left text-sm">
          <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground"><tr><th scope="col" className="px-4 py-3 font-medium">{text.examination}</th><th scope="col" className="px-4 py-3 font-medium">{text.course}</th><th scope="col" className="px-4 py-3 font-medium">{text.status}</th><th scope="col" className="px-4 py-3 font-medium">{text.schedule}</th><th scope="col" className="px-4 py-3 font-medium">{text.duration} / {text.questions}</th></tr></thead>
          <tbody className="divide-y divide-border">{pageItems.map(({ course, examination }) => <tr key={examination.id} className="transition-colors hover:bg-muted/20">
            <td className="max-w-xs px-4 py-4"><Link href={`/courses/${course.id}/examinations/${examination.id}`} className="font-semibold text-foreground hover:text-primary hover:underline">{examination.title}</Link>{examination.description ? <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{examination.description}</p> : null}</td>
            <td className="max-w-56 px-4 py-4 text-muted-foreground">{course.name}</td>
            <td className="px-4 py-4"><span className={`inline-flex whitespace-nowrap px-2.5 py-1 text-xs font-medium ${statusTone[examination.status]}`}>{statusLabel[examination.status]}</span></td>
            <td className="whitespace-nowrap px-4 py-4 text-muted-foreground"><p>{formatter.format(new Date(examination.startAt))}</p><p className="mt-1 text-xs">{text.ends}: {formatter.format(new Date(examination.dueAt))}</p></td>
            <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">{examination.durationMinutes} {text.minutes} <span className="px-1">·</span> {examination.questionCount}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="divide-y divide-border border-y border-border lg:hidden">{pageItems.map(({ course, examination }) => <article key={examination.id} className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0"><Link href={`/courses/${course.id}/examinations/${examination.id}`} className="font-semibold text-foreground hover:text-primary hover:underline">{examination.title}</Link><p className="mt-1 truncate text-sm text-muted-foreground">{course.name}</p>{examination.description ? <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{examination.description}</p> : null}</div>
        <span className={`inline-flex w-fit px-2.5 py-1 text-xs font-medium ${statusTone[examination.status]}`}>{statusLabel[examination.status]}</span>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:col-span-2 sm:grid-cols-3"><span>{text.starts}: {formatter.format(new Date(examination.startAt))}</span><span>{text.ends}: {formatter.format(new Date(examination.dueAt))}</span><span>{examination.durationMinutes} {text.minutes} · {examination.questionCount} {text.questions}</span></div>
      </article>)}</div>
      <PaginationControls page={currentPage} totalItems={sortedItems.length} onPageChange={(nextPage) => setPagination({ page: nextPage, filterKey })} />
    </>}
    {creating ? <ExaminationCreateDialog courses={courses} banks={banks} onClose={() => setCreating(false)} onCreated={(course, examination) => { setItems((current) => [{ course, examination }, ...current]); setCreating(false); }} /> : null}
  </div>;
}
