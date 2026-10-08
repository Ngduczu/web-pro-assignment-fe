import { connection } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import type { UserProfileDto } from "@/types/api";
import { UserManagement } from "@/components/admin/user-management";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  await connection();
  await requireRole("Admin");
  const query = await searchParams;
  let users: UserProfileDto[] = [];
  let total = 0;
  try {
    const result = await serverApis.users.list({ search: query.search, pageSize: 100 });
    users = result.items;
    total = result.totalCount;
  } catch {
    return <section className="border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">Users could not be loaded. Please try again later.</section>;
  }

  return <section className="space-y-10"><header className="border-b border-border pb-8"><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Administration</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Users</h1><p className="mt-3 text-muted-foreground">Manage accounts, roles, and access status.</p></header><form method="get" className="flex gap-3 border-y border-border py-4"><input name="search" defaultValue={query.search} placeholder="Search by name or email" className="h-10 min-w-0 flex-1 border border-input bg-background px-3 text-sm" /><button type="submit" className="h-10 border border-border px-4 text-sm font-medium hover:bg-muted">Search</button></form><UserManagement initialUsers={users} total={total} search={query.search ?? ""} embedded /></section>;
}
