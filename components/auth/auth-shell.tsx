import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

export function AuthShell({ title, description, children, footer, mascotSrc }: { title: string; description: string; children: ReactNode; footer?: ReactNode; mascotSrc?: string }) {
  return (
    <main className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6 lg:px-8">
        <Link href="/login" className="flex items-center gap-3 text-sm font-semibold tracking-tight">
          <Image src="/logo.png" alt="" width={32} height={32} className="size-8 object-cover" />
          SFIT Study
        </Link>
        <div className="flex items-center gap-2"><LanguageToggle /><ThemeToggle /></div>
      </header>
      <div className="flex flex-1 items-start justify-center px-4 py-12 sm:items-center sm:py-16">
        <section className="w-full max-w-md space-y-8 rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            {mascotSrc ? <Image src={mascotSrc} alt="" width={88} height={88} sizes="88px" className="size-16 shrink-0 object-contain sm:size-20" /> : null}
          </div>
          {children}
          {footer ? <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
        </section>
      </div>
    </main>
  );
}
