import { requireRole } from "@/lib/auth/session";
import { connection } from "next/server";
import { getServerLanguage, translate } from "@/lib/i18n-server";

export default async function AdminHomePage() {
  await connection();
  await requireRole("Admin");
  const language = await getServerLanguage();
  return <section className="space-y-2"><p className="text-sm font-medium text-primary">{translate(language, "Administration")}</p><h1 className="text-3xl font-semibold tracking-tight">{translate(language, "System overview")}</h1><p className="text-muted-foreground">{translate(language, "User and platform administration modules will appear here.")}</p></section>;
}
