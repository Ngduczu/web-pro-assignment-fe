"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { ChangeEventHandler, FocusEventHandler, Ref } from "react";
import { Button } from "@/components/ui/button";

export function PasswordInput({ id, name, value, onChange, onBlur, placeholder = "Password", autoComplete, ref }: { id: string; name: string; value: string; onChange: ChangeEventHandler<HTMLInputElement>; onBlur: FocusEventHandler<HTMLInputElement>; placeholder?: string; autoComplete?: string; ref?: Ref<HTMLInputElement> }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} id={id} name={name} type={visible ? "text" : "password"} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} autoComplete={autoComplete} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-11 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 size-10" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible((current) => !current)}>
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}
