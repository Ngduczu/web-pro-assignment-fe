import { requireRole } from "@/lib/auth/session";
import { connection } from "next/server";

export default async function TeacherHomePage() {
  await connection();
  await requireRole("Teacher");
  return <section className="space-y-2"><p className="text-sm font-medium text-primary">Teacher workspace</p><h1 className="text-3xl font-semibold tracking-tight">Teaching overview</h1><p className="text-muted-foreground">Course authoring and assessment modules will appear here.</p></section>;
}
