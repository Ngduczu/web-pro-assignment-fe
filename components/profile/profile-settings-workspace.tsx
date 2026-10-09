"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Check,
  Globe,
  KeyRound,
  Laptop,
  Link as LinkIcon,
  Moon,
  Pencil,
  Shield,
  Sun,
  UserRound,
  X,
  ExternalLink,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { clientApis } from "@/lib/api/client-apis";
import { authSessionApi } from "@/lib/api/auth-session-client";
import { ApiError } from "@/lib/api/errors";
import { useLanguage, type Language } from "@/lib/i18n";
import { PasswordInput } from "@/components/auth/password-input";
import { PageHeader } from "@/components/ui/page-chrome";
import type { UserProfileDto } from "@/types/api";

type ProfileSettingsWorkspaceProps = {
  user: UserProfileDto;
};

const copy = {
  en: {
    pageEyebrow: "Account",
    pageTitle: "Profile & Settings",
    pageDescription: "Manage your personal credentials, external account links, and workspace preferences.",
    personalInfo: "Personal Information",
    personalDesc: "Your basic identity and contact information across the platform.",
    accountDetails: "Account Details",
    accountDesc: "Access level, system status, and registration record.",
    editProfile: "Edit profile",
    editDialogTitle: "Edit personal profile",
    fullName: "Full name",
    phone: "Phone number",
    optional: "optional",
    email: "Email address",
    role: "Role",
    status: "Account status",
    memberSince: "Member since",
    cancel: "Cancel",
    save: "Save changes",
    saving: "Saving...",
    updateSuccess: "Profile updated successfully.",
    updateFailure: "Unable to update profile.",
    oauthSection: "External Accounts & Authentication",
    oauthDesc: "Connect external accounts for convenient and secure sign-in.",
    googleLink: "Link Google Account",
    googleLinkDesc: "Allow signing in to this LMS account using your Google account.",
    linkGoogleBtn: "Connect with Google",
    linkingGoogle: "Redirecting to Google...",
    googleConnected: "Google account connected",
    linkError: "Unable to start Google link flow.",
    passwordSection: "Password & Sessions",
    passwordDesc: "Change your password and revoke every active session on this account.",
    createPasswordDesc: "Create a password so you can also sign in with your email address.",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    changePassword: "Change password",
    createPassword: "Create password",
    changingPassword: "Updating password...",
    passwordHint: "Use 8 to 128 characters. You will be signed out after this change.",
    passwordMismatch: "New password and confirmation do not match.",
    passwordLength: "Password must contain between 8 and 128 characters.",
    passwordFailure: "Unable to update your password.",
    preferencesSection: "Interface & Appearance",
    preferencesDesc: "Customize your visual appearance and workspace display language.",
    theme: "Theme",
    themeDesc: "Choose your workspace color mode.",
    light: "Light",
    dark: "Dark",
    system: "System",
    languageTitle: "Language",
    languageDesc: "Display language for navigation and workspace labels.",
    roleStudent: "Student",
    roleTeacher: "Teacher",
    roleAdmin: "Admin",
    statusActive: "Active",
    statusInactive: "Inactive",
    statusDisabled: "Disabled",
    statusBanned: "Banned",
  },
  vi: {
    pageEyebrow: "Tài khoản",
    pageTitle: "Hồ sơ & Cài đặt",
    pageDescription: "Quản lý thông tin cá nhân, liên kết tài khoản và tùy chọn không gian làm việc.",
    personalInfo: "Thông tin cá nhân",
    personalDesc: "Thông tin nhận diện và liên hệ của bạn trên toàn hệ thống.",
    accountDetails: "Chi tiết tài khoản",
    accountDesc: "Mức phân quyền, trạng thái tài khoản và ngày đăng ký tham gia.",
    editProfile: "Chỉnh sửa hồ sơ",
    editDialogTitle: "Chỉnh sửa hồ sơ cá nhân",
    fullName: "Họ và tên",
    phone: "Số điện thoại",
    optional: "không bắt buộc",
    email: "Địa chỉ email",
    role: "Vai trò",
    status: "Trạng thái tài khoản",
    memberSince: "Ngày tham gia",
    cancel: "Hủy",
    save: "Lưu thay đổi",
    saving: "Đang lưu...",
    updateSuccess: "Cập nhật hồ sơ thành công.",
    updateFailure: "Không thể cập nhật hồ sơ.",
    oauthSection: "Tài khoản liên kết & Xác thực",
    oauthDesc: "Kết nối tài khoản bên ngoài để đăng nhập nhanh chóng và bảo mật hơn.",
    googleLink: "Liên kết tài khoản Google",
    googleLinkDesc: "Cho phép đăng nhập vào tài khoản này bằng tài khoản Google của bạn.",
    linkGoogleBtn: "Kết nối tài khoản Google",
    linkingGoogle: "Đang chuyển hướng tới Google...",
    googleConnected: "Đã kết nối tài khoản Google",
    linkError: "Không thể bắt đầu liên kết tài khoản Google.",
    passwordSection: "Mật khẩu & Phiên đăng nhập",
    passwordDesc: "Đổi mật khẩu và thu hồi toàn bộ phiên đang hoạt động của tài khoản.",
    createPasswordDesc: "Tạo mật khẩu để bạn cũng có thể đăng nhập bằng địa chỉ email.",
    currentPassword: "Mật khẩu hiện tại",
    newPassword: "Mật khẩu mới",
    confirmPassword: "Xác nhận mật khẩu mới",
    changePassword: "Đổi mật khẩu",
    createPassword: "Tạo mật khẩu",
    changingPassword: "Đang cập nhật mật khẩu...",
    passwordHint: "Dùng từ 8 đến 128 ký tự. Bạn sẽ được đăng xuất sau khi thay đổi.",
    passwordMismatch: "Mật khẩu mới và phần xác nhận không khớp.",
    passwordLength: "Mật khẩu phải có từ 8 đến 128 ký tự.",
    passwordFailure: "Không thể cập nhật mật khẩu.",
    preferencesSection: "Giao diện & Tùy chọn",
    preferencesDesc: "Tùy biến hiển thị màu sắc và ngôn ngữ không gian làm việc.",
    theme: "Giao diện màu sắc",
    themeDesc: "Chọn chế độ hiển thị sáng, tối hoặc theo hệ điều hành.",
    light: "Sáng",
    dark: "Tối",
    system: "Hệ thống",
    languageTitle: "Ngôn ngữ hiển thị",
    languageDesc: "Ngôn ngữ dùng cho thanh điều hướng và nhãn tác vụ.",
    roleStudent: "Học viên",
    roleTeacher: "Giảng viên",
    roleAdmin: "Quản trị viên",
    statusActive: "Đang hoạt động",
    statusInactive: "Chưa kích hoạt",
    statusDisabled: "Đã vô hiệu hóa",
    statusBanned: "Đã bị cấm",
  },
};

export function ProfileSettingsWorkspace({ user }: ProfileSettingsWorkspaceProps) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isVi = language === "vi";
  const text = copy[language];
  const roleLabel = user.role === "Student"
    ? text.roleStudent
    : user.role === "Teacher"
      ? text.roleTeacher
      : user.role === "Admin"
        ? text.roleAdmin
        : user.role;
  const statusLabel = user.status === "Active"
    ? text.statusActive
    : user.status === "Inactive"
      ? text.statusInactive
      : user.status === "Disabled"
        ? text.statusDisabled
        : user.status === "Banned"
          ? text.statusBanned
          : user.status;

  const [openEditor, setOpenEditor] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string>();
  const [profileSuccess, setProfileSuccess] = useState<string>();

  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [linkError, setLinkError] = useState<string>();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();

  const dateFormatter = new Intl.DateTimeFormat(isVi ? "vi-VN" : "en", {
    dateStyle: "long",
  });

  async function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError(undefined);
    setProfileSuccess(undefined);
    try {
      await clientApis.users.updateMe({
        fullName: fullName.trim(),
        phone: phone.trim() || null,
      });
      setOpenEditor(false);
      setProfileSuccess(text.updateSuccess);
      router.refresh();
    } catch (caught) {
      setProfileError(language === "en" && caught instanceof ApiError ? caught.detail : text.updateFailure);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleGoogleLink() {
    setLinkingGoogle(true);
    setLinkError(undefined);
    try {
      const response = await clientApis.auth.oauthLinkAuthorize("Google");
      if (response.authorizationUrl) {
        window.location.href = response.authorizationUrl;
      }
    } catch (caught) {
      setLinkError(language === "en" && caught instanceof ApiError ? caught.detail : text.linkError);
      setLinkingGoogle(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError(undefined);
    if (newPassword.length < 8 || newPassword.length > 128) {
      setPasswordError(text.passwordLength);
      return;
    }
    if (newPassword !== passwordConfirm) {
      setPasswordError(text.passwordMismatch);
      return;
    }

    setChangingPassword(true);
    try {
      await clientApis.users.changeMyPassword({
        currentPassword: user.hasPassword ? currentPassword : null,
        newPassword,
        passwordConfirm,
      });
      await authSessionApi.logout();
      router.replace("/login");
      router.refresh();
    } catch (caught) {
      setPasswordError(language === "en" && caught instanceof ApiError ? caught.detail : text.passwordFailure);
      setChangingPassword(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={text.pageEyebrow} title={text.pageTitle} description={text.pageDescription} />
      <div className="space-y-10">
      {/* Profile Overview Card */}
      <section className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-sm">
              {user.fullName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{user.fullName}</h2>
                <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {roleLabel}
                </span>
                <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {statusLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setProfileError(undefined);
              setProfileSuccess(undefined);
              setFullName(user.fullName);
              setPhone(user.phone ?? "");
              setOpenEditor(true);
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Pencil className="size-4" />
            {text.editProfile}
          </button>
        </div>

        {profileSuccess ? (
          <p className="mt-4 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-400">
            {profileSuccess}
          </p>
        ) : null}
      </section>

      {/* Account Info Details Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Personal Details */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <UserRound className="size-5 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">{text.personalInfo}</h3>
              <p className="text-xs text-muted-foreground">{text.personalDesc}</p>
            </div>
          </div>
          <dl className="divide-y divide-border text-sm">
            <div className="flex items-center justify-between py-3.5">
              <dt className="text-muted-foreground">{text.fullName}</dt>
              <dd className="font-medium text-foreground">{user.fullName}</dd>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <dt className="text-muted-foreground">{text.email}</dt>
              <dd className="font-medium text-foreground">{user.email}</dd>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <dt className="text-muted-foreground">{text.phone}</dt>
              <dd className="font-medium text-foreground">{user.phone || (isVi ? "Chưa cung cấp" : "Not provided")}</dd>
            </div>
          </dl>
        </section>

        {/* System & Account Details */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Shield className="size-5 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">{text.accountDetails}</h3>
              <p className="text-xs text-muted-foreground">{text.accountDesc}</p>
            </div>
          </div>
          <dl className="divide-y divide-border text-sm">
            <div className="flex items-center justify-between py-3.5">
              <dt className="text-muted-foreground">{text.role}</dt>
              <dd className="font-medium text-foreground">{roleLabel}</dd>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <dt className="text-muted-foreground">{text.status}</dt>
              <dd className="font-medium text-emerald-700 dark:text-emerald-400">{statusLabel}</dd>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <dt className="text-muted-foreground">{text.memberSince}</dt>
              <dd className="font-medium text-foreground">{dateFormatter.format(new Date(user.createdAt))}</dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Password and session security */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <KeyRound className="size-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">{text.passwordSection}</h3>
            <p className="text-xs text-muted-foreground">
              {user.hasPassword ? text.passwordDesc : text.createPasswordDesc}
            </p>
          </div>
        </div>

        <form className="mt-5 grid gap-4 sm:max-w-xl" onSubmit={handlePasswordSubmit} noValidate>
          {user.hasPassword ? (
            <label className="grid gap-1.5 text-xs font-medium text-foreground">
              {text.currentPassword}
              <PasswordInput
                id="current-password"
                name="currentPassword"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                onBlur={() => undefined}
                placeholder={text.currentPassword}
                autoComplete="current-password"
              />
            </label>
          ) : null}
          <label className="grid gap-1.5 text-xs font-medium text-foreground">
            {text.newPassword}
            <PasswordInput
              id="new-password"
              name="newPassword"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              onBlur={() => undefined}
              placeholder={text.newPassword}
              autoComplete="new-password"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-foreground">
            {text.confirmPassword}
            <PasswordInput
              id="password-confirm"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              onBlur={() => undefined}
              placeholder={text.confirmPassword}
              autoComplete="new-password"
            />
          </label>
          <p className="text-xs text-muted-foreground">{text.passwordHint}</p>
          {passwordError ? (
            <p className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
              {passwordError}
            </p>
          ) : null}
          <div>
            <button
              type="submit"
              disabled={changingPassword || (user.hasPassword && !currentPassword) || !newPassword || !passwordConfirm}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {changingPassword
                ? text.changingPassword
                : user.hasPassword
                  ? text.changePassword
                  : text.createPassword}
            </button>
          </div>
        </form>
      </section>

      {/* External Account Linking */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <LinkIcon className="size-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">{text.oauthSection}</h3>
            <p className="text-xs text-muted-foreground">{text.oauthDesc}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border/80 bg-muted/20 p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FcGoogle className="size-5 shrink-0" aria-hidden="true" />
              <p className="font-medium text-foreground">{text.googleLink}</p>
            </div>
            <p className="text-xs text-muted-foreground">{text.googleLinkDesc}</p>
          </div>
          {user.isGoogleLinked ? (
            <span className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Check className="size-3.5" />
              {text.googleConnected}
            </span>
          ) : (
            <button
              type="button"
              disabled={linkingGoogle}
              onClick={handleGoogleLink}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-xs font-semibold transition-colors hover:bg-muted disabled:opacity-50"
            >
              <ExternalLink className="size-3.5" />
              {linkingGoogle ? text.linkingGoogle : text.linkGoogleBtn}
            </button>
          )}
        </div>

        {linkError ? (
          <p className="mt-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            {linkError}
          </p>
        ) : null}
      </section>

      {/* Interface & Preferences */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Globe className="size-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">{text.preferencesSection}</h3>
            <p className="text-xs text-muted-foreground">{text.preferencesDesc}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {/* Theme switcher */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-foreground">{text.theme}</h4>
              <p className="text-xs text-muted-foreground">{text.themeDesc}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "light", label: text.light, icon: Sun },
                { id: "dark", label: text.dark, icon: Moon },
                { id: "system", label: text.system, icon: Laptop },
              ].map(({ id, label, icon: Icon }) => {
                const isSelected = theme === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTheme(id)}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 font-semibold text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language switcher */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-foreground">{text.languageTitle}</h4>
              <p className="text-xs text-muted-foreground">{text.languageDesc}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
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
                    className={`inline-flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-medium transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 font-semibold text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <span>{label}</span>
                    {isSelected ? <Check className="size-3.5" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Edit Profile Dialog */}
      {openEditor ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpenEditor(false);
          }}
        >
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-[3px]" />
          <form
            onSubmit={handleProfileSubmit}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{text.editDialogTitle}</h3>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenEditor(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="grid gap-1.5 text-xs font-medium text-foreground">
                {text.fullName}
                <input
                  required
                  maxLength={100}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-medium text-foreground">
                <span>
                  {text.phone} <span className="font-normal text-muted-foreground">({text.optional})</span>
                </span>
                <input
                  maxLength={20}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              {profileError ? (
                <p className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                  {profileError}
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setOpenEditor(false)}
                className="rounded-md border border-border px-4 py-2 text-xs font-medium hover:bg-muted"
              >
                {text.cancel}
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {savingProfile ? text.saving : text.save}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      </div>
    </div>
  );
}
