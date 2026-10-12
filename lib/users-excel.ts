import type { AdminCreateUserRequest, Role } from "@/types/api";

export const MAX_USER_IMPORT_ROWS = 200;

export type UserImportErrorCode = "email" | "fullName" | "password" | "phone" | "role" | "duplicate";

export type UserImportRow = {
  row: number;
  email: string;
  fullName: string;
  role: string;
  errors: UserImportErrorCode[];
  payload?: AdminCreateUserRequest;
};

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

const roles: Record<string, Role> = {
  student: "Student", hocvien: "Student", "học viên": "Student",
  teacher: "Teacher", giangvien: "Teacher", "giảng viên": "Teacher",
  admin: "Admin", quantrivien: "Admin", "quản trị viên": "Admin",
};
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function parseUsersWorkbook(buffer: ArrayBuffer, actorRole: "Admin" | "System"): Promise<UserImportRow[]> {
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

  const rows: UserImportRow[] = [];
  const seen = new Set<string>();
  for (let r = 2; r <= sheet.rowCount && rows.length < MAX_USER_IMPORT_ROWS; r++) {
    const row = sheet.getRow(r);
    const email = get(row, "email").toLowerCase();
    const fullName = get(row, "fullname");
    const password = get(row, "password");
    const phone = get(row, "phone");
    const roleText = get(row, "role");
    if (!email && !fullName && !password && !phone && !roleText) continue;

    const errors: UserImportErrorCode[] = [];
    if (!email || email.length > 255 || !EMAIL_PATTERN.test(email)) errors.push("email");
    else if (seen.has(email)) errors.push("duplicate");
    if (email) seen.add(email);
    if (!fullName || fullName.length > 100) errors.push("fullName");
    if (password.length < 8 || password.length > 128) errors.push("password");
    if (phone.length > 20) errors.push("phone");
    const role = roleText ? roles[roleText.toLowerCase()] : "Student";
    if (!role || (role === "Admin" && actorRole !== "System")) errors.push("role");

    rows.push({
      row: r, email, fullName, role: roleText || "Student", errors,
      payload: errors.length ? undefined : { email, fullName, phone: phone || null, password, role: role! },
    });
  }
  return rows;
}

export async function downloadUsersTemplate() {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Users");
  sheet.addRow(["Email", "FullName", "Password", "Phone", "Role"]);
  sheet.addRow(["student@example.com", "Nguyen Van A", "ChangeMe123", "0900000000", "Student"]);
  sheet.addRow(["teacher@example.com", "Tran Thi B", "ChangeMe123", "", "Teacher"]);
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((column) => { column.width = 26; });
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const guide = workbook.addWorksheet("Guide");
  [
    ["Column", "Description / Mô tả"],
    ["Email", "Required, unique / Bắt buộc, không trùng"],
    ["FullName", "Required, up to 100 characters / Bắt buộc, tối đa 100 ký tự"],
    ["Password", "Required, 8-128 characters / Bắt buộc, 8-128 ký tự"],
    ["Phone", "Optional, up to 20 characters / Tùy chọn, tối đa 20 ký tự"],
    ["Role", "Student (default), Teacher; Admin only for System accounts / Mặc định Student; Admin chỉ dành cho System"],
    ["Limit", `Up to ${MAX_USER_IMPORT_ROWS} rows per file / Tối đa ${MAX_USER_IMPORT_ROWS} dòng mỗi file`],
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
  link.download = "user-import-template.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}
