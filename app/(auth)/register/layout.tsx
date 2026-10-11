import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Đăng ký",
  description:
    "Tạo tài khoản SFIT Study để tham gia học tập trực tuyến cùng CLB Tin học trường Đại học Giao Thông Vận Tải.",
  alternates: { canonical: "/register" },
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
