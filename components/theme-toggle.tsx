"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const isDark = resolvedTheme === "dark";
  const { language } = useLanguage();
  const label = !mounted || !isDark
    ? language === "vi" ? "Chuyển sang chế độ tối" : "Switch to dark mode"
    : language === "vi" ? "Chuyển sang chế độ sáng" : "Switch to light mode";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {!mounted || !isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  );
}
