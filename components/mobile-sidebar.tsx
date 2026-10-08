"use client";

import { Menu } from "lucide-react";
import { AppSidebar, type Role } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileSidebar({ role }: { role: Role }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open navigation">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0 xl:hidden">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <AppSidebar role={role} mobile />
      </SheetContent>
    </Sheet>
  );
}
