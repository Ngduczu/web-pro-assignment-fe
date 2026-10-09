import type { CreateFillInBlankQuestionRequest, CreateMultipleChoiceQuestionRequest, QuestionDifficulty } from "@/types/api";

export const MAX_IMPORT_ROWS = 500;
const OPTION_COLUMNS = 8;
const ANSWER_COLUMNS = 5;

export type ImportErrorCode =
  | "type"
  | "content"
  | "difficulty"
  | "optionsMin"
  | "optionContent"
  | "correct"
  | "answers"
  | "answerLength";

export type ImportRow =
  | { row: number; errors: ImportErrorCode[]; content: string; kind: "MultipleChoice"; payload?: CreateMultipleChoiceQuestionRequest }
  | { row: number; errors: ImportErrorCode[]; content: string; kind: "FillInBlank"; payload?: CreateFillInBlankQuestionRequest }
  | { row: number; errors: ImportErrorCode[]; content: string; kind: null; payload?: undefined };

type CellValue = import("exceljs").CellValue;

function cellText(value: CellValue | undefined): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if ("richText" in value) return value.richText.map((part) => part.text).join("").trim();
    if ("result" in value) return cellText(value.result as CellValue);
    if ("text" in value) return String(value.text).trim();
    if (value instanceof Date) return value.toISOString();
  }
  return String(value).trim();
}

const types: Record<string, "MultipleChoice" | "FillInBlank"> = {
  mcq: "MultipleChoice",
  multiplechoice: "MultipleChoice",
  fib: "FillInBlank",
  fillinblank: "FillInBlank",
};
const difficulties: Record<string, QuestionDifficulty> = {
  easy: "Easy", de: "Easy", dễ: "Easy",
  medium: "Medium", trungbinh: "Medium", "trung bình": "Medium",
  hard: "Hard", kho: "Hard", khó: "Hard",
};
const falsy = new Set(["false", "0", "no", "n", "khong", "không"]);

export async function parseQuestionsWorkbook(buffer: ArrayBuffer): Promise<ImportRow[]> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const columns = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, col) => columns.set(cellText(cell.value).toLowerCase().replace(/\s+/g, ""), col));
  const get = (row: import("exceljs").Row, key: string) => {
    const col = columns.get(key);
    return col ? cellText(row.getCell(col).value) : "";
  };
  const indexed = (prefix: string) =>
    [...columns.keys()]
      .map((key) => ({ key, n: Number(key.match(new RegExp(`^${prefix}(\\d+)$`))?.[1]) }))
      .filter((entry) => entry.n > 0)
      .sort((a, b) => a.n - b.n)
      .map((entry) => entry.key);
  const optionKeys = indexed("option");
  const answerKeys = indexed("answer");

  const rows: ImportRow[] = [];
  for (let r = 2; r <= sheet.rowCount && rows.length < MAX_IMPORT_ROWS; r++) {
    const row = sheet.getRow(r);
    const content = get(row, "content");
    const typeText = get(row, "type");
    if (!content && !typeText && !optionKeys.some((key) => get(row, key))) continue;

    const errors: ImportErrorCode[] = [];
    const kind = types[typeText.toLowerCase().replace(/[\s_-]/g, "")] ?? null;
    if (!kind) errors.push("type");
    if (!content) errors.push("content");
    const difficultyText = get(row, "difficulty");
    const difficulty = difficultyText ? difficulties[difficultyText.toLowerCase()] : "Medium";
    if (!difficulty) errors.push("difficulty");
    const safeDifficulty = difficulty ?? "Medium";

    if (kind === "MultipleChoice") {
      const raw = optionKeys.map((key) => get(row, key));
      const last = raw.reduce((acc, value, i) => (value ? i : acc), -1);
      const optionTexts = raw.slice(0, last + 1);
      if (optionTexts.length < 2) errors.push("optionsMin");
      if (optionTexts.some((value) => !value)) errors.push("optionContent");
      const correct = Number(get(row, "correctoption"));
      if (!Number.isInteger(correct) || correct < 1 || correct > optionTexts.length) errors.push("correct");
      const shuffleText = get(row, "shuffleoptions").toLowerCase();
      rows.push({
        row: r, errors, content, kind,
        payload: errors.length ? undefined : {
          content, difficulty: safeDifficulty, shuffleOptions: !falsy.has(shuffleText),
          options: optionTexts.map((value, i) => ({ content: value, isCorrect: i + 1 === correct })),
        },
      });
    } else if (kind === "FillInBlank") {
      const answers = answerKeys.map((key) => get(row, key));
      const last = answers.reduce((acc, value, i) => (value ? i : acc), -1);
      const list = answers.slice(0, last + 1);
      if (!list.length || list.some((value) => !value)) errors.push("answers");
      if (list.some((value) => value.length > 1000)) errors.push("answerLength");
      rows.push({
        row: r, errors, content, kind,
        payload: errors.length ? undefined : {
          content, difficulty: safeDifficulty,
          answers: list.map((value, i) => ({ blankOrder: i + 1, expectedAnswer: value })),
        },
      });
    } else {
      rows.push({ row: r, errors, content, kind: null });
    }
  }
  return rows;
}

export async function downloadQuestionsTemplate() {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Questions");
  const header = [
    "Type", "Content", "Difficulty", "ShuffleOptions", "CorrectOption",
    ...Array.from({ length: OPTION_COLUMNS }, (_, i) => `Option${i + 1}`),
    ...Array.from({ length: ANSWER_COLUMNS }, (_, i) => `Answer${i + 1}`),
  ];
  sheet.addRow(header);
  const pad = (values: string[], size: number) => [...values, ...Array(size - values.length).fill("")];
  sheet.addRow(["MCQ", "2 + 2 = ?", "Easy", "TRUE", 2, ...pad(["3", "4", "5", "6", "7"], OPTION_COLUMNS), ...pad([], ANSWER_COLUMNS)]);
  sheet.addRow(["FIB", "The capital of France is ___ and its river is ___.", "Medium", "", "", ...pad([], OPTION_COLUMNS), ...pad(["Paris", "Seine"], ANSWER_COLUMNS)]);
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((column, i) => { column.width = i === 1 ? 50 : 16; });
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const guide = workbook.addWorksheet("Guide");
  [
    ["Column", "Description / Mô tả"],
    ["Type", "MCQ (multiple choice / trắc nghiệm) or FIB (fill in blank / điền chỗ trống)"],
    ["Content", "Question text, required / Nội dung câu hỏi, bắt buộc"],
    ["Difficulty", "Easy, Medium, Hard (default Medium)"],
    ["ShuffleOptions", "MCQ only: TRUE or FALSE (default TRUE) / Chỉ cho MCQ"],
    ["CorrectOption", "MCQ only: number of the correct option, e.g. 2 / Số thứ tự đáp án đúng"],
    ["Option1..Option8", "MCQ: at least 2 options, fill from Option1 without gaps / Ít nhất 2 phương án, điền liên tục"],
    ["Answer1..Answer5", "FIB: expected answer of each blank in order / Đáp án của từng chỗ trống theo thứ tự"],
    ["Limit", `Up to ${MAX_IMPORT_ROWS} rows per file / Tối đa ${MAX_IMPORT_ROWS} dòng mỗi file`],
  ].forEach((line) => guide.addRow(line));
  guide.getRow(1).font = { bold: true };
  guide.getColumn(1).width = 20;
  guide.getColumn(2).width = 90;

  const blob = new Blob([await workbook.xlsx.writeBuffer()], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "question-import-template.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}
