import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "SFIT Study",
  description: "SFIT Study learning workspace",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full">
        <AppProviders><Suspense fallback={null}><RuntimeBoundary>{children}</RuntimeBoundary></Suspense></AppProviders>
      </body>
    </html>
  );
}
