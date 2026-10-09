"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

export function LanguageToggle({ tone = "surface" }: { tone?: "surface" | "primary" }) {
  const { language, toggleLanguage, t } = useLanguage();
  const router = useRouter();
  const nextLanguage = language === "en" ? "VI" : "EN";
  const toneClasses = tone === "primary"
    ? "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15"
    : "border-primary/25 bg-primary/10 text-primary hover:border-primary/40 hover:bg-primary/15";

  return <button type="button" onClick={() => { toggleLanguage(); router.refresh(); }} className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-semibold shadow-xs transition-colors ${toneClasses}`} aria-label={`${t("language")}: ${nextLanguage}`} title={`${t("language")}: ${nextLanguage}`}><Languages className="size-4" aria-hidden="true" />{nextLanguage}</button>;
}
