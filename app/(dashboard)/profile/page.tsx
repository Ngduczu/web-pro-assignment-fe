import { CalendarDays, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { DevelopmentToastButton } from "@/components/development-toast-button";

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "long" });

export default async function ProfilePage() {
  await connection();
  const { user } = await requireAuth();
  const initial = user.fullName.slice(0, 1).toUpperCase();

  return <section className="space-y-10">
    <header className="border-b border-border pb-8"><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Account</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Profile</h1><p className="mt-3 max-w-xl text-muted-foreground">Your account information and access details.</p></header>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="border border-border bg-card shadow-sm"><div className="flex items-center gap-4 border-b border-border bg-muted/30 p-6"><div className="flex size-16 items-center justify-center bg-primary text-xl font-semibold text-primary-foreground">{initial}</div><div><h2 className="text-xl font-semibold">{user.fullName}</h2><p className="mt-1 text-sm text-muted-foreground">{user.role} account</p></div></div><dl className="divide-y divide-border"><div className="flex gap-4 px-6 py-5"><Mail className="mt-0.5 size-5 shrink-0 text-primary" /><div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Email</dt><dd className="mt-1 text-sm font-medium">{user.email}</dd></div></div><div className="flex gap-4 px-6 py-5"><Phone className="mt-0.5 size-5 shrink-0 text-primary" /><div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Phone</dt><dd className="mt-1 text-sm font-medium">{user.phone || "Not provided"}</dd></div></div><div className="flex gap-4 px-6 py-5"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" /><div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Account status</dt><dd className="mt-1 text-sm font-medium">{user.status}</dd></div></div><div className="flex gap-4 px-6 py-5"><CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" /><div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Member since</dt><dd className="mt-1 text-sm font-medium">{dateFormatter.format(new Date(user.createdAt))}</dd></div></div></dl></section>
      <aside className="border border-border bg-muted/25 p-6"><UserRound className="size-5 text-primary" /><h2 className="mt-4 font-semibold">Profile changes</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Editing personal profile details is not available in the current Backend API.</p><DevelopmentToastButton message="Profile editing is in development." className="mt-5 w-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Edit profile</DevelopmentToastButton></aside>
    </div>
  </section>;
}
