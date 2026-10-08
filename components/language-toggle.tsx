"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

export function LanguageToggle() {
  const { language, toggleLanguage, t } = useLanguage();
  const router = useRouter();
  const nextLanguage = language === "en" ? "VI" : "EN";

  return <button type="button" onClick={() => { toggleLanguage(); router.refresh(); }} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-semibold transition-colors hover:bg-accent" aria-label={`${t("language")}: ${nextLanguage}`} title={`${t("language")}: ${nextLanguage}`}><Languages className="size-4" aria-hidden="true" />{nextLanguage}</button>;
}
