"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/i18n";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return <LanguageProvider><ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>{children}</ThemeProvider></LanguageProvider>;
}
