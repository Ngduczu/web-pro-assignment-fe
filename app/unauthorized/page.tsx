import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { getServerLanguage, translate } from "@/lib/i18n-server";

export default async function UnauthorizedPage() {
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  return <AuthShell title={text("Sign in required")} description={text("You need an active LMS session to view this page.")} footer={<Link href="/login" className="font-medium text-primary hover:underline">{text("Go to sign in")}</Link>}><div className="text-center"><Link href="/login" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{text("Sign in")}</Link></div></AuthShell>;
}
