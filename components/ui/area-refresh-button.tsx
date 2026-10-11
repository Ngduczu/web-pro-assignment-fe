"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AreaRefreshButton({
  label,
  loadingLabel,
  onRefresh,
  onError,
  disabled = false,
}: {
  label: string;
  loadingLabel: string;
  onRefresh?: () => Promise<void> | void;
  onError?: (error: unknown) => void;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function refresh() {
    if (refreshing || isPending) return;
    setRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
      else startTransition(() => router.refresh());
    } catch (error) {
      onError?.(error);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={refresh} disabled={refreshing || isPending || disabled} aria-label={refreshing || isPending ? loadingLabel : label}>
      <RefreshCw className={`size-4 ${refreshing || isPending ? "animate-spin" : ""}`} aria-hidden="true" />
      {refreshing || isPending ? loadingLabel : label}
    </Button>
  );
}
