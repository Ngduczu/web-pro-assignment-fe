"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";

export type Language = "en" | "vi";

type TranslationKey =
  | "brand"
  | "language"
  | "overview"
  | "courses"
  | "lessons"
  | "assignments"
  | "examinations"
  | "examAttempts"
  | "questionBanks"
  | "messages"
  | "users"
  | "settings"
  | "collapseSidebar"
  | "expandSidebar"
  | "studentWorkspace"
  | "teacherWorkspace"
  | "administration"
  | "studentHub"
  | "teacherHub"
  | "adminHub"
  | "welcomeBack"
  | "learningWorkspace"
  | "newToSfit"
  | "createAccount"
  | "signIn"
  | "continueWithGoogle"
  | "connecting"
  | "forgotPassword"
  | "password"
  | "email"
  | "notifications"
  | "forgotPasswordTitle"
  | "forgotPasswordDescription"
  | "backToSignIn"
  | "sendResetCode"
  | "rememberedPassword"
  | "resetCodeSent"
  | "resetRequestAccepted"
  | "resetCodeRequestFailed"
  | "retryIn"
  | "accountPrivacyNotice"
  | "registerTitle"
  | "registerDescription"
  | "alreadyHaveAccount"
  | "confirmPassword"
  | "verifyEmailTitle"
  | "verifyEmailDescription"
  | "verificationCode"
  | "resetCode"
  | "resetPasswordTitle"
  | "resetPasswordDescription"
  | "newPassword"
  | "setNewPassword"
  | "verifyResetCodeTitle"
  | "verifyResetCodeDescription"
  | "requestAnother"
  | "pageNotFound"
  | "returnHome"
  | "verifyEmail"
  | "continue"
  | "resetPassword"
  | "pleaseWait"
  | "hidePassword"
  | "showPassword"
  | "createCourse"
  | "createCourseDescription"
  | "close"
  | "courseName"
  | "description"
  | "optional"
  | "maximumStudents"
  | "courseStatus"
  | "openForEnrollment"
  | "courseTeacher"
  | "selectTeacher"
  | "cancel"
  | "creating"
  | "enrollments"
  | "chat"
  | "profile"
  | "home"
  | "details"
  | "breadcrumb"
  | "navigation"
  | "signOut"
  | "signingOut";

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    brand: "SFIT Study",
    language: "Language",
    overview: "Overview",
    courses: "Courses",
    lessons: "Lessons",
    assignments: "Assignments",
    examinations: "Examinations",
    examAttempts: "Exam attempts",
    questionBanks: "Question banks",
    messages: "Messages",
    users: "Users",
    settings: "Settings",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    studentWorkspace: "Student workspace",
    teacherWorkspace: "Teacher workspace",
    administration: "Administration",
    studentHub: "Student Hub",
    teacherHub: "Teacher Hub",
    adminHub: "Admin Hub",
    welcomeBack: "Welcome back",
    learningWorkspace: "Sign in to continue to your learning workspace.",
    newToSfit: "New to SFIT Study?",
    createAccount: "Create an account",
    signIn: "Sign in",
    continueWithGoogle: "Continue with Google",
    connecting: "Connecting...",
    forgotPassword: "Forgot password?",
    password: "Password",
    email: "Email",
    notifications: "Notifications",
    forgotPasswordTitle: "Forgot password",
    forgotPasswordDescription: "Enter your email and we will send a password reset code.",
    backToSignIn: "Back to sign in",
    sendResetCode: "Send reset code",
    rememberedPassword: "Remembered your password?",
    resetCodeSent: "If an active local account exists, a reset code has been sent. Check your email.",
    resetRequestAccepted: "Request accepted.",
    resetCodeRequestFailed: "Unable to request a reset code.",
    retryIn: "Try again in",
    accountPrivacyNotice: "For account privacy, the response does not reveal whether an email exists.",
    registerTitle: "Create your account",
    registerDescription: "Register as a student and verify your email to get started.",
    alreadyHaveAccount: "Already have an account?",
    confirmPassword: "Confirm password",
    verifyEmailTitle: "Verify your email",
    verifyEmailDescription: "Enter the six-character code sent to your email address.",
    verificationCode: "Verification code",
    resetCode: "Reset code",
    resetPasswordTitle: "Set a new password",
    resetPasswordDescription: "Use your reset code and choose a new password between 8 and 128 characters.",
    newPassword: "New password",
    setNewPassword: "Set new password",
    verifyResetCodeTitle: "Verify reset code",
    verifyResetCodeDescription: "Enter the six-character code from your password reset email.",
    requestAnother: "Request another",
    pageNotFound: "Page not found",
    returnHome: "Return home",
    verifyEmail: "Verify email",
    continue: "Continue",
    resetPassword: "Reset password",
    pleaseWait: "Please wait...",
    hidePassword: "Hide password",
    showPassword: "Show password",
    createCourse: "Create course",
    createCourseDescription: "Set up a learning space for your students.",
    close: "Close",
    courseName: "Course name",
    description: "Description",
    optional: "optional",
    maximumStudents: "Maximum students",
    courseStatus: "Course status",
    openForEnrollment: "Open for enrollment",
    courseTeacher: "Course teacher",
    selectTeacher: "Select an active teacher",
    cancel: "Cancel",
    creating: "Creating...",
    enrollments: "Enrollments",
    chat: "Chat",
    profile: "Profile",
    home: "Home",
    details: "Details",
    breadcrumb: "Breadcrumb",
    navigation: "Main navigation",
    signOut: "Sign out",
    signingOut: "Signing out...",
  },
  vi: {
    brand: "SFIT Study",
    language: "Ngôn ngữ",
    overview: "Tổng quan",
    courses: "Khóa học",
    lessons: "Bài học",
    assignments: "Bài tập",
    examinations: "Kỳ thi",
    examAttempts: "Lượt thi",
    questionBanks: "Ngân hàng câu hỏi",
    messages: "Tin nhắn",
    users: "Người dùng",
    settings: "Cài đặt",
    collapseSidebar: "Thu gọn thanh bên",
    expandSidebar: "Mở rộng thanh bên",
    studentWorkspace: "Không gian học viên",
    teacherWorkspace: "Không gian giảng viên",
    administration: "Quản trị",
    studentHub: "Góc học tập",
    teacherHub: "Quản lý giảng dạy",
    adminHub: "Quản trị hệ thống",
    welcomeBack: "Chào mừng trở lại",
    learningWorkspace: "Đăng nhập để tiếp tục sử dụng không gian học tập.",
    newToSfit: "Bạn mới dùng SFIT Study?",
    createAccount: "Tạo tài khoản",
    signIn: "Đăng nhập",
    continueWithGoogle: "Tiếp tục với Google",
    connecting: "Đang kết nối...",
    forgotPassword: "Quên mật khẩu?",
    password: "Mật khẩu",
    email: "Email",
    notifications: "Thông báo",
    forgotPasswordTitle: "Quên mật khẩu",
    forgotPasswordDescription: "Nhập email để nhận mã đặt lại mật khẩu.",
    backToSignIn: "Quay lại đăng nhập",
    sendResetCode: "Gửi mã đặt lại",
    rememberedPassword: "Bạn đã nhớ mật khẩu?",
    resetCodeSent: "Nếu có tài khoản đang hoạt động với email này, mã đặt lại đã được gửi. Vui lòng kiểm tra email.",
    resetRequestAccepted: "Yêu cầu đã được tiếp nhận.",
    resetCodeRequestFailed: "Không thể yêu cầu mã đặt lại mật khẩu.",
    retryIn: "Thử lại sau",
    accountPrivacyNotice: "Để bảo vệ quyền riêng tư, phản hồi sẽ không tiết lộ email có tồn tại hay không.",
    registerTitle: "Tạo tài khoản",
    registerDescription: "Đăng ký tài khoản học viên và xác thực email để bắt đầu.",
    alreadyHaveAccount: "Bạn đã có tài khoản?",
    confirmPassword: "Xác nhận mật khẩu",
    verifyEmailTitle: "Xác thực email",
    verifyEmailDescription: "Nhập mã gồm sáu ký tự đã được gửi đến email của bạn.",
    verificationCode: "Mã xác thực",
    resetCode: "Mã đặt lại",
    resetPasswordTitle: "Đặt mật khẩu mới",
    resetPasswordDescription: "Dùng mã đặt lại và chọn mật khẩu mới từ 8 đến 128 ký tự.",
    newPassword: "Mật khẩu mới",
    setNewPassword: "Đặt mật khẩu mới",
    verifyResetCodeTitle: "Xác nhận mã đặt lại",
    verifyResetCodeDescription: "Nhập mã gồm sáu ký tự trong email đặt lại mật khẩu.",
    requestAnother: "Gửi mã khác",
    pageNotFound: "Không tìm thấy trang",
    returnHome: "Về trang chủ",
    verifyEmail: "Xác thực email",
    continue: "Tiếp tục",
    resetPassword: "Đặt lại mật khẩu",
    pleaseWait: "Vui lòng chờ...",
    hidePassword: "Ẩn mật khẩu",
    showPassword: "Hiện mật khẩu",
    createCourse: "Tạo khóa học",
    createCourseDescription: "Thiết lập không gian học tập cho học viên.",
    close: "Đóng",
    courseName: "Tên khóa học",
    description: "Mô tả",
    optional: "không bắt buộc",
    maximumStudents: "Số học viên tối đa",
    courseStatus: "Trạng thái khóa học",
    openForEnrollment: "Mở đăng ký",
    courseTeacher: "Giảng viên khóa học",
    selectTeacher: "Chọn giảng viên đang hoạt động",
    cancel: "Hủy",
    creating: "Đang tạo...",
    enrollments: "Đăng ký",
    chat: "Trò chuyện",
    profile: "Hồ sơ",
    home: "Trang chủ",
    details: "Chi tiết",
    breadcrumb: "Đường dẫn điều hướng",
    navigation: "Điều hướng chính",
    signOut: "Đăng xuất",
    signingOut: "Đang đăng xuất...",
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const LANGUAGE_KEY = "sfit-study-language";
const LANGUAGE_EVENT = "sfit-study-language-change";

function readLanguage() {
  if (typeof window === "undefined") return "vi" as Language;
  const value = window.localStorage.getItem(LANGUAGE_KEY);
  return value === "en" ? "en" : "vi";
}

function subscribeToLanguage(callback: () => void) {
  window.addEventListener(LANGUAGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(LANGUAGE_EVENT, callback); window.removeEventListener("storage", callback); };
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore<Language>(subscribeToLanguage, readLanguage, () => "vi");

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_KEY, language);
    document.cookie = `${LANGUAGE_KEY}=${language}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(nextLanguage: Language) {
    window.localStorage.setItem(LANGUAGE_KEY, nextLanguage);
    document.cookie = `${LANGUAGE_KEY}=${nextLanguage}; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(new Event(LANGUAGE_EVENT));
  }

  return <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage: () => setLanguage(language === "en" ? "vi" : "en"), t: (key) => translations[language][key] }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export type { TranslationKey };
