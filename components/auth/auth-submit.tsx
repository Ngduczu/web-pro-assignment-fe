import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AuthSubmit({ children, loading }: { children: string; loading: boolean }) {
  return <Button type="submit" className="w-full" disabled={loading}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : null}{loading ? "Please wait..." : children}</Button>;
}
