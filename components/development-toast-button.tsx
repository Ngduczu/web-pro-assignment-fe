"use client";

import { useState } from "react";

export function DevelopmentToastButton({ message, children, className }: { message: string; children: React.ReactNode; className?: string }) {
  const [visible, setVisible] = useState(false);
  return <span className="relative inline-flex"><button type="button" onClick={() => { setVisible(true); window.setTimeout(() => setVisible(false), 2800); }} className={className}>{children}</button>{visible ? <span role="status" className="absolute right-0 top-full z-10 mt-2 w-64 border border-border bg-card p-3 text-xs leading-5 text-foreground shadow-lg">{message}</span> : null}</span>;
}
