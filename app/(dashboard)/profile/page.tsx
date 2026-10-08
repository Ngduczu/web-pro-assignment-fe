import { CalendarDays, Mail, Phone, ShieldCheck } from "lucide-react";
import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { getServerLanguage, translate } from "@/lib/i18n-server";

export default async function ProfilePage() {
  await connection();
  const { user } = await requireAuth();
  const initial = user.fullName.slice(0, 1).toUpperCase();
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  const dateFormatter = new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", { dateStyle: "long" });

  return <section className="space-y-10">
    <header className="border-b border-border pb-8"><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{text("Account")}</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">{text("Profile")}</h1><p className="mt-3 max-w-xl text-muted-foreground">{text("Your account information and access details.")}</p></header>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="border border-border bg-card shadow-sm"><div className="flex items-center gap-4 border-b border-border bg-muted/30 p-6"><div className="flex size-16 items-center justify-center bg-primary text-xl font-semibold text-primary-foreground">{initial}</div><div><h2 className="text-xl font-semibold">{user.fullName}</h2><p className="mt-1 text-sm text-muted-foreground">{text(user.role)} {text("account")}</p></div></div><dl className="divide-y divide-border"><div className="flex gap-4 px-6 py-5"><Mail className="mt-0.5 size-5 shrink-0 text-primary" /><div><dt className="text-xs uppercase tracking-wider text-muted-foreground">{text("Email")}</dt><dd className="mt-1 text-sm font-medium">{user.email}</dd></div></div><div className="flex gap-4 px-6 py-5"><Phone className="mt-0.5 size-5 shrink-0 text-primary" /><div><dt className="text-xs uppercase tracking-wider text-muted-foreground">{text("Phone")}</dt><dd className="mt-1 text-sm font-medium">{user.phone || text("Not provided")}</dd></div></div><div className="flex gap-4 px-6 py-5"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" /><div><dt className="text-xs uppercase tracking-wider text-muted-foreground">{text("Account status")}</dt><dd className="mt-1 text-sm font-medium">{text(user.status)}</dd></div></div><div className="flex gap-4 px-6 py-5"><CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" /><div><dt className="text-xs uppercase tracking-wider text-muted-foreground">{text("Member since")}</dt><dd className="mt-1 text-sm font-medium">{dateFormatter.format(new Date(user.createdAt))}</dd></div></div></dl></section>
      <ProfileEditor user={user} />
    </div>
  </section>;
}
