import { connection } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import type { UserProfileDto } from "@/types/api";
import { UserManagement } from "@/components/admin/user-management";
import { AlertBanner, PageHeader } from "@/components/ui/page-chrome";
import { getServerLanguage, translate } from "@/lib/i18n-server";

export const instant = false;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  await connection();
  await requireRole("Admin");
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  const query = await searchParams;
  let users: UserProfileDto[] = [];
  let total = 0;

  try {
    const result = await serverApis.users.list({ search: query.search, pageSize: 100 });
    users = result.items;
    total = result.totalCount;
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
        description={language === "vi" ? "Quản lý danh sách tài khoản, vai trò và trạng thái truy cập." : "Manage accounts, roles, and access status across the platform."}
      />
      <form method="get" className="flex gap-3 border-y border-border py-4">
        <input
          name="search"
          defaultValue={query.search}
          placeholder={language === "vi" ? "Tìm theo tên hoặc email" : "Search by name or email"}
          className="h-10 min-w-0 flex-1 border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button type="submit" className="h-10 border border-border px-4 text-sm font-medium hover:bg-muted">
          {language === "vi" ? "Tìm" : "Search"}
        </button>
      </form>
      <UserManagement initialUsers={users} total={total} search={query.search ?? ""} embedded />
    </section>
  );
}
