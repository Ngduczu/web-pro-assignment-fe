"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentPropsWithoutRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = "left",
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: "left" | "right";
}) {
  const { language } = useLanguage();

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay data-motion-overlay className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        data-motion-sheet
        data-side={side}
        className={cn(
          "fixed z-50 flex h-full w-[min(20rem,calc(100vw-2rem))] flex-col border-border bg-sidebar text-sidebar-foreground shadow-xl outline-none",
          side === "left" ? "inset-y-0 left-0 border-r" : "inset-y-0 right-0 border-l",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <X className="size-4" />
          <span className="sr-only">{language === "vi" ? "Đóng menu" : "Close menu"}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-base font-semibold", className)} {...props} />;
}
