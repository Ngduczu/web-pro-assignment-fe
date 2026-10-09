"use client";

import { Menu } from "lucide-react";
import { AppSidebar, type Role } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/lib/i18n";

export function MobileSidebar({ role }: { role: Role }) {
  const { language } = useLanguage();
  const navigationLabel = language === "vi" ? "Điều hướng" : "Navigation";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="xl:hidden" aria-label={language === "vi" ? "Mở điều hướng" : "Open navigation"}>
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0 xl:hidden">
        <SheetTitle className="sr-only">{navigationLabel}</SheetTitle>
        <AppSidebar role={role} mobile />
      </SheetContent>
    </Sheet>
  );
}
