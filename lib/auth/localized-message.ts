import type { Language } from "@/lib/i18n";

const vietnameseMessages: Record<string, string> = {
  "Email is required.": "Vui lòng nhập email.",
  "Email must be 255 characters or fewer.": "Email không được vượt quá 255 ký tự.",
  "Enter a valid email address.": "Vui lòng nhập địa chỉ email hợp lệ.",
  "Full name is required.": "Vui lòng nhập họ và tên.",
  "Full name must be 100 characters or fewer.": "Họ và tên không được vượt quá 100 ký tự.",
  "Phone number must be 20 characters or fewer.": "Số điện thoại không được vượt quá 20 ký tự.",
  "Code must contain exactly 6 characters.": "Mã phải có đúng 6 ký tự.",
  "Code contains unsupported characters.": "Mã chứa ký tự không được hỗ trợ.",
  "Password must be at least 8 characters.": "Mật khẩu phải có ít nhất 8 ký tự.",
  "Password must be 128 characters or fewer.": "Mật khẩu không được vượt quá 128 ký tự.",
  "Confirm your password.": "Vui lòng xác nhận mật khẩu.",
  "Passwords do not match.": "Mật khẩu xác nhận không khớp.",
};

export function localizeAuthMessage(language: Language, message?: string) {
  if (!message || language === "en") return message;
  return vietnameseMessages[message] ?? message;
}
