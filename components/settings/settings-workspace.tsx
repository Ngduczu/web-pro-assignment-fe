"use client";

import { useTheme } from "next-themes";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useLanguage, type Language } from "@/lib/i18n";
import type { UserProfileDto } from "@/types/api";

type SettingsWorkspaceProps = {
  user: UserProfileDto;
};

export function SettingsWorkspace({ user }: SettingsWorkspaceProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const isVi = language === "vi";

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{isVi ? "Giao diện" : "Appearance"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isVi ? "Chủ đề màu sắc của không gian làm việc." : "Workspace color theme."}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 border-y border-border py-4 sm:max-w-md">
          {[
            { id: "light", label: isVi ? "Sáng" : "Light", icon: Sun },
            { id: "dark", label: isVi ? "Tối" : "Dark", icon: Moon },
            { id: "system", label: isVi ? "Hệ thống" : "System", icon: Laptop },
          ].map(({ id, label, icon: Icon }) => {
            const isSelected = theme === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className={`flex flex-col items-center gap-2 border px-3 py-3 text-xs font-medium transition-colors ${
                  isSelected ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
                }`}
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{isVi ? "Ngôn ngữ" : "Language"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isVi ? "Ngôn ngữ hiển thị giao diện." : "Interface language."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 border-y border-border py-4 sm:max-w-md">
          {[
            { id: "vi" as Language, label: "Tiếng Việt" },
            { id: "en" as Language, label: "English" },
          ].map(({ id, label }) => {
            const isSelected = language === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setLanguage(id)}
                className={`inline-flex items-center justify-center gap-2 border px-3 py-3 text-sm font-medium transition-colors ${
                  isSelected ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
                }`}
              >
                <span>{label}</span>
                {isSelected ? <Check className="size-3.5" /> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{isVi ? "Tài khoản" : "Account"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isVi ? "Thông tin chỉ đọc. Chỉnh sửa hồ sơ tại trang Profile." : "Read-only details. Edit your profile on the Profile page."}
          </p>
        </div>
        <dl className="divide-y divide-border border-y border-border text-sm">
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-muted-foreground">{isVi ? "Vai trò" : "Role"}</dt>
            <dd className="font-medium">{user.role}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-muted-foreground">{isVi ? "Trạng thái" : "Status"}</dt>
            <dd className="font-medium">{user.status}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-muted-foreground">{isVi ? "Tham gia từ" : "Member since"}</dt>
            <dd className="font-medium">
              {new Intl.DateTimeFormat(isVi ? "vi-VN" : "en", { dateStyle: "long" }).format(new Date(user.createdAt))}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
