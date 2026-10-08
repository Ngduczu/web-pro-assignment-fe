import { Bell, LockKeyhole, Palette, Settings2 } from "lucide-react";
import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { DevelopmentToastButton } from "@/components/development-toast-button";

const settings = [
  { icon: Bell, title: "Notifications", description: "Control email and in-app notification preferences." },
  { icon: LockKeyhole, title: "Security", description: "Manage password, sessions, and account security." },
  { icon: Palette, title: "Appearance", description: "Choose your preferred visual experience." },
];

export default async function SettingsPage() {
  await connection();
  const { user } = await requireAuth();
  return <section className="space-y-10">
    <header className="border-b border-border pb-8"><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{user.role} workspace</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Settings</h1><p className="mt-3 max-w-xl text-muted-foreground">Workspace preferences and account controls.</p></header>
    <div className="max-w-3xl space-y-3">{settings.map(({ icon: Icon, title, description }) => <DevelopmentToastButton key={title} message={`${title} settings are in development.`} className="group flex w-full items-center gap-4 border border-border bg-card p-5 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"><span className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary"><Icon className="size-5" /></span><span className="min-w-0 flex-1"><span className="block font-semibold">{title}</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span></span><Settings2 className="size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" /></DevelopmentToastButton>)}</div>
    <div className="max-w-3xl border border-dashed border-border p-5 text-sm text-muted-foreground">Settings actions are currently unavailable because the Backend does not expose account-preference APIs yet.</div>
  </section>;
}
