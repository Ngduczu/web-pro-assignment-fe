"use client";

export default function DashboardRouteError({ reset }: { reset: () => void }) {
  return <section className="space-y-4 border border-destructive/40 bg-destructive/5 p-6"><h1 className="text-xl font-semibold">Dashboard unavailable</h1><p className="text-sm text-muted-foreground">The dashboard encountered an unexpected error while loading.</p><button type="button" onClick={() => reset()} className="border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Try again</button></section>;
}