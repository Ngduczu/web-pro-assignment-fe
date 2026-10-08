import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";

export default function UnauthorizedPage() {
  return <AuthShell title="Sign in required" description="You need an active LMS session to view this page." footer={<Link href="/login" className="font-medium text-primary hover:underline">Go to sign in</Link>}><div className="text-center"><Link href="/login" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Sign in</Link></div></AuthShell>;
}
