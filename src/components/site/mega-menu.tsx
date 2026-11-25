"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { MenuCategory } from "@/server/queries/categories";
import { MAIN_NAV } from "./nav-links";

const TOP_LINK =
  "inline-flex h-11 flex-row items-center gap-0 rounded-md px-3 py-0 text-base font-medium text-stone-900 hover:bg-stone-50 hover:text-jade-700";

/**
 * Desktop navigation. Radix NavigationMenu provides keyboard support
 * (Tab / arrow keys / Enter) and closes on Esc or outside click.
 * The panel spans the header container (which must be `relative`).
 */
export function MegaMenu({ categories }: { categories: MenuCategory[] }) {
  return (
    // Radix wraps the list in a div with inline `position: relative`; force it static so the
    // panel anchors to the header container instead.
    <NavigationMenu viewport={false} className="static [&>div]:static!" aria-label="Menu chính">
      <NavigationMenuList className="gap-0">
        {categories.length ? (
          <NavigationMenuItem className="static">
            <NavigationMenuTrigger className="h-11 bg-transparent px-3 text-base font-medium text-stone-900 hover:bg-stone-50 hover:text-jade-700 data-[state=open]:bg-stone-50 data-[state=open]:text-jade-700">
              Sản phẩm
            </NavigationMenuTrigger>
            <NavigationMenuContent className="right-0 left-0 mt-0 rounded-t-none border-x-0 bg-white p-6 shadow-lg md:w-full">
              <ul className="grid grid-cols-3 gap-x-8 gap-y-6 xl:grid-cols-6">
                {categories.map((group) => (
                  <li key={group.id}>
                    <NavigationMenuLink
                      asChild
                      className="p-0 font-heading text-lg font-semibold text-jade-700 hover:bg-transparent hover:text-jade-700 hover:underline focus:bg-transparent"
                    >
                      <Link href={`/${group.slug}/`}>{group.name}</Link>
                    </NavigationMenuLink>
                    <span aria-hidden className="mt-2 mb-3 block h-0.5 w-8 bg-gold-600" />
                    <ul className="space-y-1">
                      {group.children.map((child) => (
                        <li key={child.id}>
                          <NavigationMenuLink
                            asChild
                            className="px-0 py-1.5 text-base text-stone-700 hover:bg-transparent hover:text-jade-700 focus:bg-transparent"
                          >
                            <Link href={`/${child.slug}/`}>{child.name}</Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ) : null}
        {MAIN_NAV.map((item) => (
          <NavigationMenuItem key={item.href}>
            <NavigationMenuLink asChild className={TOP_LINK}>
              <Link href={item.href}>{item.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
