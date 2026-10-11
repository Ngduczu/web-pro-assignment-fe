import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/theme-script";
import { RuntimeBoundary } from "@/components/runtime-boundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sfit-study.ducvu.site";
const siteDescription =
  "SFIT Study là nền tảng học trực tuyến dành cho thành viên Câu lạc bộ Tin học trường Đại học Giao thông Vận tải (SFIT - UTC): khóa học, bài tập, thi trực tuyến và trao đổi trong một nơi.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SFIT Study - Nền tảng học trực tuyến CLB Tin học UTC",
    template: "%s | SFIT Study",
  },
  description: siteDescription,
  applicationName: "SFIT Study",
  keywords: [
    "SFIT Study",
    "SFIT",
    "CLB Tin học",
    "Đại học Giao thông Vận tải",
    "UTC",
    "học trực tuyến",
    "LMS",
    "thi trực tuyến",
    "lập trình",
  ],
  authors: [{ name: "Nguyễn Đức Vũ" }],
  creator: "Nguyễn Đức Vũ",
  publisher: "CLB Tin học - Đại học Giao thông Vận tải",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "SFIT Study",
    locale: "vi_VN",
    url: "/",
    title: "SFIT Study - Nền tảng học trực tuyến CLB Tin học UTC",
    description: siteDescription,
    images: [{ url: "/logo.png", alt: "SFIT Study" }],
  },
  twitter: {
    card: "summary",
    title: "SFIT Study - Nền tảng học trực tuyến CLB Tin học UTC",
    description: siteDescription,
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/logo.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SFIT Study",
  url: siteUrl,
  description: siteDescription,
  inLanguage: "vi",
  author: { "@type": "Person", name: "Nguyễn Đức Vũ" },
  publisher: {
    "@type": "Organization",
    name: "CLB Tin học - Đại học Giao thông Vận tải",
    logo: `${siteUrl}/logo.png`,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <AppProviders><Suspense fallback={null}><RuntimeBoundary>{children}</RuntimeBoundary></Suspense></AppProviders>
      </body>
    </html>
  );
}
