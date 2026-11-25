"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileText,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  Menu,
  MessageSquareQuote,
  Newspaper,
  PhoneCall,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { AdminNavItem } from "./admin-nav";

const ICONS = {
  dashboard: LayoutDashboard,
  leads: PhoneCall,
  categories: FolderTree,
  projects: Building2,
  posts: Newspaper,
  pages: FileText,
  testimonials: MessageSquareQuote,
  banners: ImageIcon,
  settings: Settings,
} as const;

function isActive(pathname: string, href: string) {
  return href === "/admin/"
    ? pathname === "/admin/" || pathname === "/admin"
    : pathname.startsWith(href);
}

function NavList({ items, onNavigate }: { items: AdminNavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="grid gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-md px-3 font-medium text-stone-700 hover:bg-jade-50 hover:text-jade-700",
                active && "bg-jade-700 text-white hover:bg-jade-700 hover:text-white",
              )}
            >
              <Icon aria-hidden className="size-5 shrink-0" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Desktop sidebar (lg+). */
export function AdminSidebar({ items }: { items: AdminNavItem[] }) {
  return (
    <nav aria-label="Menu quản trị" className="hidden w-64 shrink-0 border-r bg-white p-4 lg:block">
      <NavList items={items} />
    </nav>
  );
}

/** Mobile: menu button opening a sheet (< lg). */
export function AdminMobileNav({ items }: { items: AdminNavItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Mở menu quản trị" className="lg:hidden">
            <Menu aria-hidden className="size-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-4">
          <SheetHeader className="px-0">
            <SheetTitle className="font-heading text-jade-700">Quản trị</SheetTitle>
            <SheetDescription className="sr-only">Các mục quản trị</SheetDescription>
          </SheetHeader>
          <nav aria-label="Menu quản trị (di động)">
            <NavList items={items} onNavigate={() => setOpen(false)} />
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
