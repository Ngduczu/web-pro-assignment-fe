import { requireRole } from "@/lib/auth/session";
import { connection } from "next/server";

export default async function StudentHomePage() {
  await connection();
  await requireRole("Student");
  return <section className="space-y-2"><p className="text-sm font-medium text-primary">Student workspace</p><h1 className="text-3xl font-semibold tracking-tight">Your learning overview</h1><p className="text-muted-foreground">Course and examination modules will appear here.</p></section>;
}
