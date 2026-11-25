import Link from "next/link";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhone, telHref } from "@/lib/phone";
import type { SiteSettings } from "@/schemas/site-settings";
import type { MenuCategory } from "@/server/queries/categories";
import { MegaMenu } from "./mega-menu";
import { MobileMenu } from "./mobile-menu";

/** Sticky white header: menu button (mobile) + logo left, mega menu centre, hotline right. */
export function SiteHeader({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: MenuCategory[];
}) {
  const { brandName, hotline } = settings;

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
      {/* `relative` anchors the full-width mega menu panel. */}
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 md:h-20 md:px-6">
        <div className="flex min-w-0 items-center gap-1">
          <MobileMenu categories={categories} brandName={brandName} />
          <Link
            href="/"
            className="truncate py-1 font-heading text-lg leading-normal font-bold text-jade-700 md:text-xl"
          >
            {brandName}
          </Link>
        </div>

        <div className="hidden lg:block">
          <MegaMenu categories={categories} />
        </div>

        {hotline ? (
          <Button asChild variant="call" className="shrink-0">
            <a href={telHref(hotline)} aria-label={`Gọi hotline ${formatPhone(hotline)}`}>
              <Phone aria-hidden />
              <span className="hidden sm:inline">{formatPhone(hotline)}</span>
              <span className="sm:hidden">Gọi</span>
            </a>
          </Button>
        ) : null}
      </div>
    </header>
  );
}
