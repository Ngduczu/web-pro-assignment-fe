import { requireRole } from "@/lib/auth/session";
import { connection } from "next/server";
import { getServerLanguage, translate } from "@/lib/i18n-server";

export default async function StudentHomePage() {
  await connection();
  await requireRole("Student");
  const language = await getServerLanguage();
  return <section className="space-y-2"><p className="text-sm font-medium text-primary">{translate(language, "Student workspace")}</p><h1 className="text-3xl font-semibold tracking-tight">{translate(language, "Your learning overview")}</h1><p className="text-muted-foreground">{translate(language, "Course and examination modules will appear here.")}</p></section>;
}
