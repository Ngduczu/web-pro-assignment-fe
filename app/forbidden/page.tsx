import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ForbiddenPage() {
  return <AuthShell title="Access denied" description="Your account does not have permission to view this page." footer={<Link href="/" className="font-medium text-primary hover:underline">Return to workspace</Link>}><div className="text-center"><Link href="/" className="inline-flex h-10 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent">Return to workspace</Link></div></AuthShell>;
}
