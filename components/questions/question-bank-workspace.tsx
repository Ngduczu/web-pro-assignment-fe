"use client";

import { useMemo, useState } from "react";
import { CirclePlus, FileSpreadsheet, Pencil, Search, Share2, Trash2, UserRound, X } from "lucide-react";
import { clientApis } from "@/lib/api/client-apis";
import { ApiError } from "@/lib/api/errors";
import type { ChatUserSearchDto, QuestionBankDto, QuestionDifficulty, QuestionDto, QuestionType } from "@/types/api";
import { QuestionBankSidebar } from "@/components/questions/question-bank-sidebar";
import { QuestionCard } from "@/components/questions/question-card";
import { QuestionImportDialog } from "@/components/questions/question-import-dialog";
import { useLanguage } from "@/lib/i18n";
import { FieldError, RequiredMark, ValidatedForm } from "@/components/ui/form-field-feedback";
import { PaginatedChildren } from "@/components/ui/paginated-list";
import { EmptyState } from "@/components/ui/page-chrome";
import { AreaRefreshButton } from "@/components/ui/area-refresh-button";

type BankWithQuestions = { bank: QuestionBankDto; questions: QuestionDto[] };

const inputClass = "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const areaClass = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const copy = {
  en: {
    addQuestion: "Add question",
    importExcel: "Import Excel",
    editBank: "Edit bank",
    deleteBank: "Delete bank",
    shareBank: "Share bank",
    shareTitle: "Share question bank",
    shareDesc: "Find an active teacher by exact email, then share a copy of this bank and all its questions.",
    recipientEmail: "Recipient teacher email",
    search: "Search",
    searching: "Searching...",
    noUser: "No active user was found with this email.",
    notTeacher: "This account is not a teacher.",
    share: "Share",
    sharing: "Sharing...",
    shareError: "Unable to share question bank.",
    shareSuccess: (email: string) => `Question bank shared with ${email}.`,
    cancel: "Cancel",
    deleteBankConfirm: (name: string) => `Delete “${name}” and all of its questions?`,
    deleteQuestionConfirm: "Delete this question?",
    noQuestions: "No questions in this bank yet.",
    noMatchingQuestions: "No questions match these filters.",
    allDifficulties: "All difficulties",
    allTypes: "All question types",
    questionType: "Question type",
    clearFilters: "Clear filters",
    questionCount: (count: number) => `${count} questions`,
    selectOrCreate: "Select or create a question bank.",
    noBanksAvailable: "No question banks are available.",
    owner: "Owner",
    readOnly: "View only",
    newBankTitle: "New question bank",
    editBankTitle: "Edit question bank",
    bankDesc: "Organize reusable questions for examinations.",
    bankName: "Bank name",
    bankDescription: "Description",
    saving: "Saving...",
    saveBank: "Save question bank",
    newQuestionTitle: "New question",
    editQuestionTitle: "Edit question",
    mcq: "Multiple choice",
    fib: "Fill in blank",
    questionContent: "Question content",
    difficulty: "Difficulty",
    options: "Options",
    shuffle: "Shuffle options",
    optionPlaceholder: (n: number) => `Option ${n}`,
    expectedAnswers: "Expected answers",
    blankPlaceholder: (n: number) => `Blank ${n}`,
    addBlank: "+ Add blank",
    addOption: "+ Add option",
    removeOption: "Remove option",
    saveQuestion: "Save question",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    saveBankError: "Unable to save question bank.",
    deleteBankError: "Unable to delete question bank.",
    saveQuestionError: "Unable to save question.",
    deleteQuestionError: "Unable to delete question.",
    refresh: "Refresh question banks", refreshing: "Refreshing...", refreshError: "Unable to refresh question banks.",
  },
  vi: {
    addQuestion: "Thêm câu hỏi",
    importExcel: "Nhập Excel",
    editBank: "Sửa ngân hàng",
    deleteBank: "Xóa ngân hàng",
    shareBank: "Chia sẻ ngân hàng",
    shareTitle: "Chia sẻ ngân hàng câu hỏi",
    shareDesc: "Tìm giảng viên đang hoạt động bằng email chính xác, sau đó chia sẻ bản sao ngân hàng cùng toàn bộ câu hỏi.",
    recipientEmail: "Email giảng viên nhận",
    search: "Tìm kiếm",
    searching: "Đang tìm...",
    noUser: "Không tìm thấy tài khoản đang hoạt động với email này.",
    notTeacher: "Tài khoản này không phải giảng viên.",
    share: "Chia sẻ",
    sharing: "Đang chia sẻ...",
    shareError: "Không thể chia sẻ ngân hàng câu hỏi.",
    shareSuccess: (email: string) => `Đã chia sẻ ngân hàng cho ${email}.`,
    cancel: "Hủy",
    deleteBankConfirm: (name: string) => `Xóa ngân hàng “${name}” và tất cả câu hỏi bên trong?`,
    deleteQuestionConfirm: "Xóa câu hỏi này?",
    noQuestions: "Chưa có câu hỏi nào trong ngân hàng này.",
    noMatchingQuestions: "Không có câu hỏi phù hợp với bộ lọc.",
    allDifficulties: "Mọi độ khó",
    allTypes: "Mọi loại câu hỏi",
    questionType: "Loại câu hỏi",
    clearFilters: "Xóa bộ lọc",
    questionCount: (count: number) => `${count} câu hỏi`,
    selectOrCreate: "Chọn hoặc tạo mới một ngân hàng câu hỏi.",
    noBanksAvailable: "Chưa có ngân hàng câu hỏi nào.",
    owner: "Chủ sở hữu",
    readOnly: "Chỉ xem",
    newBankTitle: "Ngân hàng câu hỏi mới",
    editBankTitle: "Chỉnh sửa ngân hàng câu hỏi",
    bankDesc: "Tổ chức và quản lý câu hỏi tái sử dụng cho các kỳ thi.",
    bankName: "Tên ngân hàng",
    bankDescription: "Mô tả",
    saving: "Đang lưu...",
    saveBank: "Lưu ngân hàng câu hỏi",
    newQuestionTitle: "Câu hỏi mới",
    editQuestionTitle: "Chỉnh sửa câu hỏi",
    mcq: "Trắc nghiệm một lựa chọn",
    fib: "Điền vào chỗ trống",
    questionContent: "Nội dung câu hỏi",
    difficulty: "Độ khó",
    options: "Các phương án lựa chọn",
    shuffle: "Xáo trộn phương án",
    optionPlaceholder: (n: number) => `Phương án ${n}`,
    expectedAnswers: "Đáp án mong đợi cho các chỗ trống",
    blankPlaceholder: (n: number) => `Chỗ trống ${n}`,
    addBlank: "+ Thêm chỗ trống",
    addOption: "+ Thêm phương án",
    removeOption: "Xóa phương án",
    saveQuestion: "Lưu câu hỏi",
    easy: "Dễ",
    medium: "Trung bình",
    hard: "Khó",
    saveBankError: "Không thể lưu ngân hàng câu hỏi.",
    deleteBankError: "Không thể xóa ngân hàng câu hỏi.",
    saveQuestionError: "Không thể lưu câu hỏi.",
    deleteQuestionError: "Không thể xóa câu hỏi.",
    refresh: "Làm mới ngân hàng câu hỏi", refreshing: "Đang làm mới...", refreshError: "Không thể làm mới ngân hàng câu hỏi.",
  },
};

export function QuestionBankWorkspace({
  initialItems,
  userId,
  role,
}: {
  initialItems: BankWithQuestions[];
  userId: string;
  role: "Teacher" | "Admin" | "System";
}) {
  const { language } = useLanguage();
  const text = copy[language];
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState(initialItems[0]?.bank.id ?? "");
  const [bankModal, setBankModal] = useState(false);
  const [questionModal, setQuestionModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [editingBank, setEditingBank] = useState<QuestionBankDto>();
  const [editingQuestion, setEditingQuestion] = useState<QuestionDto>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [refreshError, setRefreshError] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareUser, setShareUser] = useState<ChatUserSearchDto>();
  const [searching, setSearching] = useState(false);
  const [bankName, setBankName] = useState("");
  const [bankDescription, setBankDescription] = useState("");
  const [teacherId, setTeacherId] = useState(userId);
  const [type, setType] = useState<QuestionType>("MultipleChoice");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | QuestionDifficulty>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | QuestionType>("all");
  const [content, setContent] = useState("");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("Medium");
  const [shuffle, setShuffle] = useState(true);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [answers, setAnswers] = useState([""]);
  const [answerOrders, setAnswerOrders] = useState([1]);
  const readOnly = role === "Admin" || role === "System";
  const selected = useMemo(() => items.find((item) => item.bank.id === selectedId), [items, selectedId]);
  const filteredQuestions = useMemo(
    () => selected?.questions.filter((question) =>
      (difficultyFilter === "all" || question.difficulty === difficultyFilter) &&
      (typeFilter === "all" || question.type === typeFilter),
    ) ?? [],
    [selected, difficultyFilter, typeFilter],
  );

  async function refreshBanks() {
    if (refreshing) return;
    setRefreshing(true);
    setRefreshError(undefined);
    try {
      const banks = await clientApis.questions.listBanks(role === "Teacher" ? userId : undefined);
      const latestItems = await Promise.all(banks.map(async (bank) => ({ bank, questions: await clientApis.questions.listQuestions(bank.id) })));
      setItems(latestItems);
      setSelectedId((current) => latestItems.some((item) => item.bank.id === current) ? current : latestItems[0]?.bank.id ?? "");
    } catch (caught) {
      setRefreshError(language === "en" && caught instanceof ApiError ? caught.detail : text.refreshError);
    } finally {
      setRefreshing(false);
    }
  }

  function openBank(bank?: QuestionBankDto) {
    setEditingBank(bank);
    setBankName(bank?.name ?? "");
    setBankDescription(bank?.description ?? "");
    setTeacherId(bank?.teacherId ?? userId);
    setError(undefined);
    setBankModal(true);
  }

  function openQuestion(question?: QuestionDto) {
    setEditingQuestion(question);
    setType(question?.type ?? "MultipleChoice");
    setContent(question?.content ?? "");
    setDifficulty(question?.difficulty ?? "Medium");
    setShuffle(question?.shuffleOptions ?? true);
    const sortedOptions = [...(question?.options ?? [])].sort((a, b) => a.order - b.order);
    const sortedAnswers = [...(question?.answers ?? [])].sort((a, b) => a.blankOrder - b.blankOrder);
    setOptions(sortedOptions.length ? sortedOptions.map((option) => option.content) : ["", "", "", ""]);
    setCorrectIndex(Math.max(0, sortedOptions.findIndex((option) => option.isCorrect)));
    setAnswers(sortedAnswers.length ? sortedAnswers.map((answer) => answer.expectedAnswer) : [""]);
    setAnswerOrders(sortedAnswers.length ? sortedAnswers.map((answer) => answer.blankOrder) : [1]);
    setError(undefined);
    setQuestionModal(true);
  }

  function message(caught: unknown, fallback: string) {
    return language === "en" && caught instanceof ApiError ? caught.detail : fallback;
  }

  async function saveBank(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      const bank = editingBank
        ? await clientApis.questions.updateBank(editingBank.id, {
            name: bankName.trim(),
            description: bankDescription.trim() || null,
          })
        : await clientApis.questions.createBank({
            teacherId,
            name: bankName.trim(),
            description: bankDescription.trim() || null,
          });
      setItems((current) =>
        editingBank
          ? current.map((item) => (item.bank.id === bank.id ? { ...item, bank } : item))
          : [...current, { bank, questions: [] }],
      );
      setSelectedId(bank.id);
      setBankModal(false);
    } catch (caught) {
      setError(message(caught, text.saveBankError));
    } finally {
      setBusy(false);
    }
  }

  async function searchShareUser(event: React.FormEvent) {
    event.preventDefault();
    setSearching(true);
    setError(undefined);
    setShareUser(undefined);
    try {
      const found = await clientApis.users.findForChat(shareEmail.trim());
      if (found.role === "Teacher") setShareUser(found);
      else setError(text.notTeacher);
    } catch (caught) {
      setError(caught instanceof ApiError && !caught.isNotFound ? message(caught, text.noUser) : text.noUser);
    } finally {
      setSearching(false);
    }
  }

  async function shareBank() {
    if (!selected || !shareUser) return;
    setBusy(true);
    setError(undefined);
    setNotice(undefined);
    try {
      const email = shareUser.email;
      await clientApis.questions.shareBank(selected.bank.id, { recipientEmail: email });
      setShareModal(false);
      setNotice(text.shareSuccess(email));
    } catch (caught) {
      setError(message(caught, text.shareError));
    } finally {
      setBusy(false);
    }
  }

  async function removeBank(bank: QuestionBankDto) {
    if (!confirm(text.deleteBankConfirm(bank.name))) return;
    setBusy(true);
    setError(undefined);
    try {
      await clientApis.questions.removeBank(bank.id);
      setItems((current) => current.filter((item) => item.bank.id !== bank.id));
      setSelectedId((current) => (current === bank.id ? "" : current));
    } catch (caught) {
      setError(message(caught, text.deleteBankError));
    } finally {
      setBusy(false);
    }
  }

  async function saveQuestion(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError(undefined);
    try {
      let question: QuestionDto;
      if (editingQuestion) {
        question = await clientApis.questions.updateQuestion(editingQuestion.id, {
          content: content.trim(),
          difficulty,
          ...(type === "MultipleChoice"
            ? {
                shuffleOptions: shuffle,
                options: options.map((value, index) => ({ content: value.trim(), isCorrect: index === correctIndex })),
              }
            : { answers: answers.map((value, index) => ({ blankOrder: answerOrders[index] ?? index + 1, expectedAnswer: value.trim() })) }),
        });
      } else if (type === "MultipleChoice") {
        question = await clientApis.questions.createMultipleChoice(selected.bank.id, {
          content: content.trim(),
          difficulty,
          shuffleOptions: shuffle,
          options: options.map((value, index) => ({ content: value.trim(), isCorrect: index === correctIndex })),
        });
      } else {
        question = await clientApis.questions.createFillInBlank(selected.bank.id, {
          content: content.trim(),
          difficulty,
          answers: answers.map((value, index) => ({ blankOrder: index + 1, expectedAnswer: value.trim() })),
        });
      }
      setItems((current) =>
        current.map((item) =>
          item.bank.id !== selected.bank.id
            ? item
            : {
                ...item,
                questions: editingQuestion
                  ? item.questions.map((old) => (old.id === question.id ? question : old))
                  : [...item.questions, question],
              },
        ),
      );
      setQuestionModal(false);
    } catch (caught) {
      setError(message(caught, text.saveQuestionError));
    } finally {
      setBusy(false);
    }
  }

  async function removeQuestion(question: QuestionDto) {
    if (!confirm(text.deleteQuestionConfirm)) return;
    setBusy(true);
    setError(undefined);
    try {
      await clientApis.questions.removeQuestion(question.id);
      setItems((current) =>
        current.map((item) => ({
          ...item,
          questions: item.questions.filter((candidate) => candidate.id !== question.id),
        })),
      );
    } catch (caught) {
      setError(message(caught, text.deleteQuestionError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>
      ) : null}
      {refreshError ? (
        <div role="alert" className="border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">{refreshError}</div>
      ) : null}
      {notice ? (
        <div className="border border-primary/40 bg-primary/5 p-4 text-sm text-primary">{notice}</div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <QuestionBankSidebar
          items={items}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={readOnly ? undefined : () => openBank()}
          showOwner={readOnly}
          refreshAction={<AreaRefreshButton className="w-full" label={text.refresh} loadingLabel={text.refreshing} onRefresh={refreshBanks} disabled={refreshing || busy || bankModal || questionModal || importModal || shareModal} />}
        />
        <main className="min-w-0">
          {selected ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold">{selected.bank.name}</h2>
                    {readOnly ? (
                      <span className="rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
                        {text.readOnly}
                      </span>
                    ) : null}
                  </div>
                  {readOnly ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{text.owner}:</span>{" "}
                      {selected.bank.ownerFullName} · {selected.bank.ownerEmail}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selected.bank.description || (language === "vi" ? "Chưa có mô tả." : "No description provided.")}
                  </p>
                </div>
                {!readOnly ? <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    onClick={() => openBank(selected.bank)}
                    className="border border-border p-2 hover:bg-muted"
                    aria-label={text.editBank}
                    title={text.editBank}
                  >
                    <Pencil className="size-4" />
                  </button>
                  {role === "Teacher" && selected.bank.teacherId === userId ? (
                    <button
                      onClick={() => {
                        setShareEmail("");
                        setShareUser(undefined);
                        setError(undefined);
                        setNotice(undefined);
                        setShareModal(true);
                      }}
                      className="border border-border p-2 hover:bg-muted"
                      aria-label={text.shareBank}
                      title={text.shareBank}
                    >
                      <Share2 className="size-4" />
                    </button>
                  ) : null}
                  <button
                    onClick={() => removeBank(selected.bank)}
                    disabled={busy}
                    className="border border-destructive/30 p-2 text-destructive hover:bg-destructive/5 disabled:opacity-50"
                    aria-label={text.deleteBank}
                    title={text.deleteBank}
                  >
                    <Trash2 className="size-4" />
                  </button>
                  <button
                    onClick={() => setImportModal(true)}
                    className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    <FileSpreadsheet className="size-4" /> {text.importExcel}
                  </button>
                  <button
                    onClick={() => openQuestion()}
                    className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <CirclePlus className="size-4" /> {text.addQuestion}
                  </button>
                </div> : null}
              </div>
              {!selected.questions.length ? (
                <EmptyState mascotSrc="/assets/owlie/think.webp">{text.noQuestions}</EmptyState>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-2 sm:p-4">
                    <label className="grid gap-1.5 text-sm font-medium">
                      <span>{text.difficulty}</span>
                      <select
                        value={difficultyFilter}
                        onChange={(event) => setDifficultyFilter(event.target.value as "all" | QuestionDifficulty)}
                        className={inputClass}
                      >
                        <option value="all">{text.allDifficulties}</option>
                        <option value="Easy">{text.easy}</option>
                        <option value="Medium">{text.medium}</option>
                        <option value="Hard">{text.hard}</option>
                      </select>
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium">
                      <span>{text.questionType}</span>
                      <select
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value as "all" | QuestionType)}
                        className={inputClass}
                      >
                        <option value="all">{text.allTypes}</option>
                        <option value="MultipleChoice">{text.mcq}</option>
                        <option value="FillInBlank">{text.fib}</option>
                      </select>
                    </label>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground sm:col-span-2">
                      <span aria-live="polite">{text.questionCount(filteredQuestions.length)}</span>
                      {difficultyFilter !== "all" || typeFilter !== "all" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setDifficultyFilter("all");
                            setTypeFilter("all");
                          }}
                          className="font-medium text-primary hover:underline"
                        >
                          {text.clearFilters}
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {!filteredQuestions.length ? (
                    <EmptyState mascotSrc="/assets/owlie/think.webp">{text.noMatchingQuestions}</EmptyState>
                  ) : (
                    <PaginatedChildren
                      listClassName="space-y-3"
                      resetKey={`${selected.bank.id}:${difficultyFilter}:${typeFilter}`}
                    >
                      {filteredQuestions.map((question, index) => (
                        <QuestionCard
                          key={question.id}
                          question={question}
                          index={index}
                          onEdit={readOnly ? undefined : () => openQuestion(question)}
                          onDelete={readOnly ? undefined : () => removeQuestion(question)}
                        />
                      ))}
                    </PaginatedChildren>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              {readOnly ? text.noBanksAvailable : text.selectOrCreate}
            </div>
          )}
        </main>
      </div>

      {/* Share Modal */}
      {!readOnly && shareModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setShareModal(false)}
            aria-label={language === "vi" ? "Đóng" : "Close"}
          />
          <ValidatedForm
            onSubmit={searchShareUser}
            className="relative w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
          >
            <div className="flex justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{text.shareTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{text.shareDesc}</p>
              </div>
              <button type="button" onClick={() => setShareModal(false)}>
                <X className="size-5" />
              </button>
            </div>
            <div className="flex items-start gap-2">
              <label className="grid min-w-0 flex-1 gap-2 text-sm font-medium">
                <span>{text.recipientEmail}<RequiredMark /></span>
                <input
                  required
                  type="email"
                  data-field-error="share-email"
                  maxLength={255}
                  value={shareEmail}
                  onChange={(event) => {
                    setShareEmail(event.target.value);
                    setShareUser(undefined);
                  }}
                  className={inputClass}
                />
                <FieldError field="share-email" />
              </label>
              <button
                disabled={searching}
                className="mt-7 inline-flex h-10 shrink-0 items-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                <Search className="size-4" />
                {searching ? text.searching : text.search}
              </button>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {shareUser ? (
              <div className="flex items-center gap-3 border border-border bg-muted/30 p-4">
                <span className="flex size-11 shrink-0 items-center justify-center bg-primary/10 text-primary">
                  <UserRound className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{shareUser.fullName}</p>
                  <p className="truncate text-sm text-muted-foreground">{shareUser.email}</p>
                </div>
              </div>
            ) : null}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShareModal(false)} className="border border-border px-4 py-2 text-sm hover:bg-muted">
                {text.cancel}
              </button>
              <button
                type="button"
                onClick={shareBank}
                disabled={busy || !shareUser}
                className="bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {busy ? text.sharing : text.share}
              </button>
            </div>
          </ValidatedForm>
        </div>
      ) : null}

      {/* Bank Modal */}
      {!readOnly && bankModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setBankModal(false)}
            aria-label={language === "vi" ? "Đóng" : "Close"}
          />
          <ValidatedForm
            onSubmit={saveBank}
            className="relative w-full max-w-lg space-y-5 rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingBank ? text.editBankTitle : text.newBankTitle}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{text.bankDesc}</p>
              </div>
              <button type="button" onClick={() => setBankModal(false)}>
                <X className="size-5" />
              </button>
            </div>
            <label className="grid gap-2 text-sm font-medium">
              <span>{text.bankName}<RequiredMark /></span>
              <input
                required
                data-field-error="bank-name"
                maxLength={200}
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
                className={inputClass}
              />
              <FieldError field="bank-name" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              {text.bankDescription}
              <textarea
                rows={3}
                value={bankDescription}
                onChange={(event) => setBankDescription(event.target.value)}
                className={areaClass}
              />
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <button
              disabled={busy}
              className="h-10 w-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? text.saving : text.saveBank}
            </button>
          </ValidatedForm>
        </div>
      ) : null}

      {!readOnly && importModal && selected ? (
        <QuestionImportDialog
          bankId={selected.bank.id}
          bankName={selected.bank.name}
          onClose={() => setImportModal(false)}
          onImported={(created) =>
            setItems((current) =>
              current.map((item) =>
                item.bank.id === selected.bank.id ? { ...item, questions: [...item.questions, ...created] } : item,
              ),
            )
          }
        />
      ) : null}

      {/* Question Modal */}
      {!readOnly && questionModal && selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <button
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setQuestionModal(false)}
            aria-label={language === "vi" ? "Đóng" : "Close"}
          />
          <ValidatedForm
            onSubmit={saveQuestion}
            className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingQuestion ? text.editQuestionTitle : text.newQuestionTitle}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{selected.bank.name}</p>
              </div>
              <button type="button" onClick={() => setQuestionModal(false)}>
                <X className="size-5" />
              </button>
            </div>

            {!editingQuestion ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("MultipleChoice")}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    type === "MultipleChoice"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {text.mcq}
                </button>
                <button
                  type="button"
                  onClick={() => setType("FillInBlank")}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    type === "FillInBlank"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {text.fib}
                </button>
              </div>
            ) : null}

            <label className="grid gap-2 text-sm font-medium">
              <span>{text.questionContent}<RequiredMark /></span>
              <textarea
                required
                data-field-error="question-content"
                maxLength={4000}
                rows={4}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className={areaClass}
              />
              <FieldError field="question-content" />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              {text.difficulty}
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as QuestionDifficulty)}
                className={inputClass}
              >
                <option value="Easy">{text.easy}</option>
                <option value="Medium">{text.medium}</option>
                <option value="Hard">{text.hard}</option>
              </select>
            </label>

            {type === "MultipleChoice" ? (
              <fieldset className="space-y-3">
                <div className="flex items-center justify-between">
                  <legend className="text-sm font-medium">{text.options}<RequiredMark /></legend>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffle}
                      onChange={(event) => setShuffle(event.target.checked)}
                    />{" "}
                    {text.shuffle}
                  </label>
                </div>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={correctIndex === index}
                      onChange={() => setCorrectIndex(index)}
                      aria-label={`Correct option ${index + 1}`}
                      className="size-4"
                    />
                    <input
                      required
                      data-field-error={`question-option-${index}`}
                      value={option}
                      onChange={(event) =>
                        setOptions((current) => current.map((value, i) => (i === index ? event.target.value : value)))
                      }
                      placeholder={text.optionPlaceholder(index + 1)}
                      className={inputClass}
                    />
                    <FieldError field={`question-option-${index}`} className="basis-full" />
                    {options.length > 2 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setOptions((current) => current.filter((_, i) => i !== index));
                          setCorrectIndex((current) =>
                            current === index ? 0 : current > index ? current - 1 : current,
                          );
                        }}
                        className="rounded-lg border border-border px-3 py-2 hover:bg-muted"
                        aria-label={text.removeOption}
                        title={text.removeOption}
                      >
                        <X className="size-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setOptions((current) => [...current, ""])}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {text.addOption}
                </button>
              </fieldset>
            ) : null}

            {type === "FillInBlank" ? (
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">{text.expectedAnswers}<RequiredMark /></legend>
                {answers.map((answer, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      required
                      data-field-error={`question-answer-${index}`}
                      value={answer}
                      onChange={(event) =>
                        setAnswers((current) => current.map((value, i) => (i === index ? event.target.value : value)))
                      }
                      placeholder={text.blankPlaceholder(editingQuestion ? (answerOrders[index] ?? index + 1) : index + 1)}
                      className={inputClass}
                    />
                    <FieldError field={`question-answer-${index}`} className="basis-full" />
                    {answers.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAnswers((current) => current.filter((_, i) => i !== index));
                          setAnswerOrders((current) => current.filter((_, i) => i !== index));
                        }}
                        className="rounded-lg border border-border px-3 hover:bg-muted"
                      >
                        <X className="size-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setAnswers((current) => [...current, ""]);
                    setAnswerOrders((current) => [...current, Math.max(0, ...current) + 1]);
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {text.addBlank}
                </button>
              </fieldset>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <button
              disabled={busy}
              className="h-10 w-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? text.saving : text.saveQuestion}
            </button>
          </ValidatedForm>
        </div>
      ) : null}
    </div>
  );
}
