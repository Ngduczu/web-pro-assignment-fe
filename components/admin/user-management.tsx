"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, UserRound, Shield, X } from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import type { AccountStatus, Role, UserProfileDto } from "@/types/api";
import { useLanguage } from "@/lib/i18n";

const copy = {
  en: {
    addUser: "Add user",
    directory: "Directory",
    accountsFound: (total: number, search: string) => `${total} account${total === 1 ? "" : "s"} found${search ? ` for "${search}"` : ""}.`,
    noUsers: "No users found.",
    user: "User",
    role: "Role",
    status: "Status",
    actions: "Actions",
    edit: "Edit",
    changeStatus: "Change status",
    active: "Active",
    inactive: "Inactive",
    disabled: "Disabled",
    banned: "Banned",
    editUser: "Edit user",
    createUser: "Add user",
    editDescription: "Update account details and role.",
    createDescription: "Create a new user account with initial role and credentials.",
    fullName: "Full name",
    email: "Email",
    tempPassword: "Temporary password",
    phone: "Phone",
    optional: "optional",
    student: "Student",
    teacher: "Teacher",
    admin: "Admin",
    cancel: "Cancel",
    close: "Close",
    saving: "Saving...",
    saveChanges: "Save changes",
    createUserSubmit: "Create user",
    saveError: "Unable to save user.",
    statusError: "Unable to update account status.",
  },
  vi: {
    addUser: "Thêm người dùng",
    directory: "Danh bạ người dùng",
    accountsFound: (total: number, search: string) => `Tìm thấy ${total} tài khoản${search ? ` cho từ khóa "${search}"` : ""}.`,
    noUsers: "Không tìm thấy người dùng nào.",
    user: "Người dùng",
    role: "Vai trò",
    status: "Trạng thái",
    actions: "Thao tác",
    edit: "Chỉnh sửa",
    changeStatus: "Đổi trạng thái",
    active: "Đang hoạt động",
    inactive: "Chưa kích hoạt",
    disabled: "Đã vô hiệu hóa",
    banned: "Bị cấm",
    editUser: "Chỉnh sửa người dùng",
    createUser: "Thêm người dùng mới",
    editDescription: "Cập nhật thông tin tài khoản và vai trò.",
    createDescription: "Tạo tài khoản mới với vai trò và thông tin xác thực ban đầu.",
    fullName: "Họ và tên",
    email: "Email",
    tempPassword: "Mật khẩu tạm thời",
    phone: "Số điện thoại",
    optional: "không bắt buộc",
    student: "Học viên",
    teacher: "Giảng viên",
    admin: "Quản trị viên",
    cancel: "Hủy",
    close: "Đóng",
    saving: "Đang lưu...",
    saveChanges: "Lưu thay đổi",
    createUserSubmit: "Tạo người dùng",
    saveError: "Không thể lưu thông tin người dùng.",
    statusError: "Không thể cập nhật trạng thái tài khoản.",
  },
};

export function UserManagement({
  initialUsers,
  total,
  search,
  embedded = false,
}: {
  initialUsers: UserProfileDto[];
  total: number;
  search: string;
  embedded?: boolean;
}) {
  const router = useRouter();
  const { language } = useLanguage();
  const text = copy[language];
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [statusDialogUser, setStatusDialogUser] = useState<UserProfileDto>();
  const [editing, setEditing] = useState<UserProfileDto>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Student");

  function startCreate() {
    setEditing(undefined);
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("Student");
    setError(undefined);
    setOpen(true);
  }

  function startEdit(user: UserProfileDto) {
    setEditing(user);
    setFullName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone ?? "");
    setRole(user.role);
    setError(undefined);
    setOpen(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      if (editing) {
        const updated = await clientApis.users.update(editing.id, {
          fullName,
          phone: phone || null,
          role,
        });
        setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await clientApis.users.create({
          email,
          fullName,
          phone: phone || null,
          password,
          role,
        });
        setUsers((current) => [created, ...current]);
      }
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.saveError);
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(user: UserProfileDto, status: AccountStatus) {
    setBusy(true);
    setError(undefined);
    try {
      const updated = await clientApis.users.updateStatus(user.id, { status });
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setStatusDialogUser(undefined);
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.statusError);
    } finally {
      setBusy(false);
    }
  }

  const statusBadge = (status: AccountStatus) => {
    switch (status) {
      case "Active":
        return <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">{text.active}</span>;
      case "Inactive":
        return <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{text.inactive}</span>;
      case "Disabled":
        return <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">{text.disabled}</span>;
      case "Banned":
        return <span className="inline-flex items-center rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">{text.banned}</span>;
    }
  };

  const roleBadge = (r: Role) => {
    switch (r) {
      case "Admin":
        return <span className="inline-flex items-center gap-1 rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300"><Shield className="size-3" />{text.admin}</span>;
      case "Teacher":
        return <span className="inline-flex items-center rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">{text.teacher}</span>;
      case "Student":
        return <span className="inline-flex items-center rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground">{text.student}</span>;
    }
  };

  return (
    <>
      {!embedded ? (
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex h-10 items-center justify-center gap-2 border border-primary bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          {text.addUser}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{text.directory}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {text.accountsFound(total, search)}
              </p>
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex h-10 items-center gap-2 border border-primary bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-4" />
              {text.addUser}
            </button>
          </div>

          {error ? (
            <p className="border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {!users.length ? (
            <p className="border border-dashed border-border p-6 text-sm text-muted-foreground">
              {text.noUsers}
            </p>
          ) : (
            <div className="overflow-x-auto border border-border bg-card">
              <table className="w-full min-w-[50rem] text-left text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">{text.user}</th>
                    <th className="px-4 py-3 font-medium">{text.role}</th>
                    <th className="px-4 py-3 font-medium">{text.status}</th>
                    <th className="px-4 py-3 text-right font-medium">{text.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                            {user.fullName.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-medium text-foreground">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                            {user.phone ? <p className="text-xs text-muted-foreground/80">{user.phone}</p> : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">{roleBadge(user.role)}</td>
                      <td className="px-4 py-3.5">{statusBadge(user.status)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(user)}
                            className="border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                          >
                            {text.edit}
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusDialogUser(user)}
                            disabled={busy}
                            className="border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                          >
                            {text.changeStatus}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Change Status Dialog */}
      {statusDialogUser ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setStatusDialogUser(undefined);
          }}
        >
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-[3px]" />
          <div className="relative w-full max-w-sm border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{text.changeStatus}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{statusDialogUser.fullName}</p>
              </div>
              <button
                type="button"
                onClick={() => setStatusDialogUser(undefined)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 space-y-2">
              {(["Active", "Inactive", "Disabled", "Banned"] as AccountStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={busy || statusDialogUser.status === status}
                  onClick={() => updateStatus(statusDialogUser, status)}
                  className={`flex w-full items-center justify-between border px-4 py-2.5 text-sm font-medium transition-colors ${
                    statusDialogUser.status === status
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span>{statusBadge(status)}</span>
                  {statusDialogUser.status === status ? <span className="text-xs text-muted-foreground">({language === "vi" ? "Hiện tại" : "Current"})</span> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Create / Edit User Dialog */}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-[3px]" />
          <form
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <UserRound className="size-5 text-primary" />
                <h2 className="mt-3 text-xl font-semibold">
                  {editing ? text.editUser : text.createUser}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {editing ? text.editDescription : text.createDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {text.close}
              </button>
            </div>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                {text.fullName}
                <input
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="h-10 border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              {!editing ? (
                <label className="grid gap-2 text-sm font-medium">
                  {text.email}
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-10 border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
              ) : null}
              {!editing ? (
                <label className="grid gap-2 text-sm font-medium">
                  {text.tempPassword}
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-10 border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
              ) : null}
              <label className="grid gap-2 text-sm font-medium">
                {text.phone} <span className="font-normal text-muted-foreground">({text.optional})</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-10 border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                {text.role}
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as Role)}
                  className="h-10 border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Student">{text.student}</option>
                  <option value="Teacher">{text.teacher}</option>
                  <option value="Admin">{text.admin}</option>
                </select>
              </label>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                {text.cancel}
              </button>
              <button
                type="submit"
                disabled={busy}
                className="bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {busy ? text.saving : editing ? text.saveChanges : text.createUserSubmit}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
