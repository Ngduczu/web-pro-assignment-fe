import { requireRole } from "@/lib/auth/session";
import { connection } from "next/server";

export default async function AdminHomePage() {
  await connection();
  await requireRole("Admin");
  return <section className="space-y-2"><p className="text-sm font-medium text-primary">Administration</p><h1 className="text-3xl font-semibold tracking-tight">System overview</h1><p className="text-muted-foreground">User and platform administration modules will appear here.</p></section>;
}
