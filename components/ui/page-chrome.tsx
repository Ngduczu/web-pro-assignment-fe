import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  mascotSrc,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  mascotSrc?: string;
}) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/8 blur-3xl" />
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className={cn("min-w-0 max-w-2xl space-y-1.5", mascotSrc && "md:max-w-[calc(100%-9rem)]")}>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p> : null}
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground sm:text-base">{description}</p> : null}
        </div>
        {mascotSrc ? (
          <Image
            src={mascotSrc}
            alt=""
            width={180}
            height={180}
            sizes="180px"
            className="hidden size-32 shrink-0 object-contain md:block lg:size-36"
          />
        ) : null}
      </div>
      {actions ? <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}

export function PageSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4 rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ children, mascotSrc }: { children: ReactNode; mascotSrc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground sm:flex-row sm:gap-4 sm:py-5">
      {mascotSrc ? <Image src={mascotSrc} alt="" width={88} height={88} sizes="88px" className="size-20 shrink-0 object-contain" /> : null}
      <div>{children}</div>
    </div>
  );
}

export function StatRow({ stats }: { stats: { label: string; value: string | number }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={stat.label} className="motion-lift relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/30 hover:shadow-sm">
          <span className="absolute right-4 top-4 text-4xl font-bold text-primary/8">{String(index + 1).padStart(2, "0")}</span>
          <p className="relative text-sm text-muted-foreground">{stat.label}</p>
          <p className="relative mt-3 text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export function TextLink({ href, children, variant = "outline" }: { href: string; children: ReactNode; variant?: "primary" | "outline" }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors",
        variant === "primary" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border hover:bg-muted",
      )}
    >
      {children}
    </Link>
  );
}

export function AlertBanner({ children, tone = "danger" }: { children: ReactNode; tone?: "danger" | "warning" | "info" }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        tone === "danger" && "border-destructive/40 bg-destructive/5 text-destructive",
        tone === "warning" && "border-amber-500/40 bg-amber-500/5 text-amber-800 dark:text-amber-200",
        tone === "info" && "border-border bg-muted/40 text-foreground",
      )}
    >
      {children}
    </div>
  );
}

export function ListRow({ children, href }: { children: ReactNode; href?: string }) {
  const content = <div className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">{children}</div>;
  if (!href) return content;
  return (
    <Link href={href} className="block transition-colors hover:bg-muted/40">
      {content}
    </Link>
  );
}

export function DividedList({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-xl border border-border divide-y divide-border">{children}</div>;
}
