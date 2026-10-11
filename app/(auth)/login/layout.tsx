import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description:
    "Đăng nhập SFIT Study để học các khóa học, làm bài tập và thi trực tuyến dành cho thành viên CLB Tin học Đại học Giao Thông Vận Tải.",
  alternates: { canonical: "/login" },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
