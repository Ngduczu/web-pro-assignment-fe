import { connection } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import type { AccountStatus, Role, UserProfileDto } from "@/types/api";
import { UserManagement } from "@/components/admin/user-management";
import { AlertBanner, PageHeader } from "@/components/ui/page-chrome";
import { getServerLanguage, translate } from "@/lib/i18n-server";

export const instant = false;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string; role?: string; status?: string }> }) {
  await connection();
  const { user } = await requireRole("Admin", "System");
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  const query = await searchParams;
  const requestedPage = Number(query.page);
  let page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const roles: Role[] = ["Student", "Teacher", "Admin", "System"];
  const statuses: AccountStatus[] = ["Active", "Inactive", "Disabled", "Banned"];
  const role = roles.find((value) => value === query.role);
  const status = statuses.find((value) => value === query.status);
  let users: UserProfileDto[] = [];
  let total = 0;

  try {
    const result = await serverApis.users.list({ search: query.search, role, status, page, pageSize: 20 });
    users = result.items;
    total = result.totalCount;
    if (result.page !== page && result.totalCount > 0) page = result.page;
  } catch {
    return (
      <AlertBanner>
        {language === "vi" ? "Không thể tải danh sách người dùng. Vui lòng thử lại sau." : "Users could not be loaded. Please try again later."}
      </AlertBanner>
    );
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title={text("Users")}
        description={user.role === "System"
          ? language === "vi" ? "Quản lý tài khoản và cấp quyền quản trị viên hệ thống." : "Manage accounts and grant system administrator access."
          : language === "vi" ? "Quản lý tài khoản giảng viên và học viên." : "Manage teacher and student accounts."}
      />
      <form method="get" className="grid grid-cols-1 gap-3 border-y border-border py-4 sm:grid-cols-[minmax(0,1fr)_10rem_11rem_auto] sm:items-end">
        <label className="flex min-w-0 flex-col gap-1">
          <span className="h-4 text-xs font-medium leading-4 text-muted-foreground">
            {language === "vi" ? "Tìm kiếm" : "Search"}
          </span>
          <input
            name="search"
            defaultValue={query.search}
            placeholder={language === "vi" ? "Tìm theo tên hoặc email" : "Search by name or email"}
            className="h-10 min-w-0 border border-input bg-background px-3 text-sm font-normal text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="h-4 text-xs font-medium leading-4 text-muted-foreground">
            {language === "vi" ? "Vai trò tài khoản" : "Account role"}
          </span>
          <select
            name="role"
            defaultValue={role ?? ""}
            className="h-10 border border-input bg-background px-3 text-sm font-normal text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{language === "vi" ? "Tất cả vai trò" : "All roles"}</option>
            <option value="Student">{language === "vi" ? "Học viên" : "Student"}</option>
            <option value="Teacher">{language === "vi" ? "Giảng viên" : "Teacher"}</option>
            <option value="Admin">{language === "vi" ? "Quản trị viên" : "Admin"}</option>
            <option value="System">{language === "vi" ? "Quản trị hệ thống" : "System"}</option>
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="h-4 text-xs font-medium leading-4 text-muted-foreground">
            {language === "vi" ? "Trạng thái tài khoản" : "Account status"}
          </span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="h-10 border border-input bg-background px-3 text-sm font-normal text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{language === "vi" ? "Tất cả trạng thái" : "All statuses"}</option>
            <option value="Active">{language === "vi" ? "Đang hoạt động" : "Active"}</option>
            <option value="Inactive">{language === "vi" ? "Chưa kích hoạt" : "Inactive"}</option>
            <option value="Disabled">{language === "vi" ? "Đã vô hiệu hóa" : "Disabled"}</option>
            <option value="Banned">{language === "vi" ? "Bị cấm" : "Banned"}</option>
          </select>
        </label>
        <button type="submit" className="h-10 w-full border border-border px-4 text-sm font-medium hover:bg-muted sm:w-auto sm:justify-self-end">
          {language === "vi" ? "Lọc" : "Apply filters"}
        </button>
      </form>
      <UserManagement key={`${page}:${query.search ?? ""}:${role ?? ""}:${status ?? ""}`} initialUsers={users} total={total} page={page} search={query.search ?? ""} filterRole={role} filterStatus={status} actorRole={user.role === "System" ? "System" : "Admin"} embedded />
    </section>
  );
}
