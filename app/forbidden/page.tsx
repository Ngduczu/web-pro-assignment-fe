import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { getServerLanguage, translate } from "@/lib/i18n-server";

export default async function ForbiddenPage() {
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);
  return <AuthShell title={text("Access denied")} description={text("Your account does not have permission to view this page.")} footer={<Link href="/" className="font-medium text-primary hover:underline">{text("Return to workspace")}</Link>}><div className="text-center"><Link href="/" className="inline-flex h-10 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent">{text("Return to workspace")}</Link></div></AuthShell>;
}
