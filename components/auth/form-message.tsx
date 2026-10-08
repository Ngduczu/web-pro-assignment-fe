import { AlertCircle, CheckCircle2 } from "lucide-react";

export function FormMessage({ message, tone = "error" }: { message?: string; tone?: "error" | "success" }) {
  if (!message) return null;
  const isSuccess = tone === "success";
  return (
    <div role={isSuccess ? "status" : "alert"} className={isSuccess ? "flex gap-2 rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-foreground" : "flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"}>
      {isSuccess ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <AlertCircle className="mt-0.5 size-4 shrink-0" />}
      <span>{message}</span>
    </div>
  );
}
