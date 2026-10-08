"use client";

import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

export function AuthSubmit({ children, loading, disabled = false }: { children: string; loading: boolean; disabled?: boolean }) {
  const { t } = useLanguage();
  return <Button type="submit" className="w-full" disabled={loading || disabled}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : null}{loading ? t("pleaseWait") : children}</Button>;
}
