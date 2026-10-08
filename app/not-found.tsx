import Link from "next/link";
import { getServerLanguage, translate } from "@/lib/i18n-server";

export default async function NotFound() {
  const language = await getServerLanguage();
  return <main className="flex min-h-screen items-center justify-center bg-background px-4"><section className="max-w-md space-y-3 text-center"><p className="text-sm font-medium text-primary">404</p><h1 className="text-2xl font-semibold">{translate(language, "Page not found")}</h1><p className="text-sm text-muted-foreground">{translate(language, "The page you requested does not exist.")}</p><Link href="/" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">{translate(language, "Return home")}</Link></section></main>;
}
