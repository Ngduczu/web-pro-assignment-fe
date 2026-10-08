import { requireRole } from "@/lib/auth/session";
import { connection } from "next/server";
import { getServerLanguage, translate } from "@/lib/i18n-server";

export default async function TeacherHomePage() {
  await connection();
  await requireRole("Teacher");
  const language = await getServerLanguage();
  return <section className="space-y-2"><p className="text-sm font-medium text-primary">{translate(language, "Teacher workspace")}</p><h1 className="text-3xl font-semibold tracking-tight">{translate(language, "Teaching overview")}</h1><p className="text-muted-foreground">{translate(language, "Course authoring and assessment modules will appear here.")}</p></section>;
}
