import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthShell({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6 lg:px-8">
        <Link href="/login" className="flex items-center gap-3 text-sm font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">L</span>
          LMS Portal
        </Link>
        <ThemeToggle />
      </header>
      <div className="flex flex-1 items-start justify-center px-4 py-12 sm:items-center sm:py-16">
        <section className="w-full max-w-md space-y-8 rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {children}
          {footer ? <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
        </section>
      </div>
    </main>
  );
}
