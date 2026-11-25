"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { MenuCategory } from "@/server/queries/categories";
import { MAIN_NAV } from "./nav-links";

const ROW = "flex min-h-12 items-center py-2 text-lg text-stone-900 hover:text-jade-700";

/** Mobile drawer (slides from the left) with one accordion section per category group. */
export function MobileMenu({
  categories,
  brandName,
}: {
  categories: MenuCategory[];
  brandName: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Mở menu" className="lg:hidden">
          <Menu aria-hidden className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm gap-0 overflow-y-auto p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="pr-10 font-heading text-lg text-jade-700">{brandName}</SheetTitle>
          <SheetDescription className="sr-only">
            Danh mục sản phẩm và các trang chính
          </SheetDescription>
        </SheetHeader>

        <nav aria-label="Menu di động" className="px-5 pb-8">
          {categories.length ? (
            <Accordion type="single" collapsible>
              {categories.map((group) => (
                <AccordionItem key={group.id} value={group.id}>
                  <AccordionTrigger className="min-h-12 items-center py-2 text-lg font-semibold text-stone-900 hover:no-underline">
                    {group.name}
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <ul className="border-l-2 border-gold-600 pl-4">
                      <li>
                        <SheetClose asChild>
                          <Link
                            href={`/${group.slug}/`}
                            className={`${ROW} font-medium text-jade-700`}
                          >
                            Tất cả {group.name.toLowerCase()}
                          </Link>
                        </SheetClose>
                      </li>
                      {group.children.map((child) => (
                        <li key={child.id}>
                          <SheetClose asChild>
                            <Link href={`/${child.slug}/`} className={ROW}>
                              {child.name}
                            </Link>
                          </SheetClose>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : null}

          <ul className="mt-2">
            {MAIN_NAV.map((item) => (
              <li key={item.href} className="border-b">
                <SheetClose asChild>
                  <Link href={item.href} className={`${ROW} font-semibold`}>
                    {item.label}
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
