import Link from "next/link";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhone, telHref } from "@/lib/phone";
import type { SiteSettings } from "@/schemas/site-settings";
import { MAIN_NAV } from "./nav-links";

/** Sticky white header: logo left, menu centre, hotline right. */
export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const { brandName, hotline } = settings;

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-6">
        <Link
          href="/"
          className="font-heading text-lg leading-tight font-bold text-jade-700 md:text-xl"
        >
          {brandName}
        </Link>

        <nav aria-label="Menu chính" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-11 items-center rounded-md px-3 font-medium text-stone-900 hover:bg-stone-50 hover:text-jade-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {hotline ? (
          <Button asChild variant="call" className="shrink-0">
            <a href={telHref(hotline)} aria-label={`Gọi hotline ${formatPhone(hotline)}`}>
              <Phone aria-hidden />
              <span className="hidden sm:inline">{formatPhone(hotline)}</span>
              <span className="sm:hidden">Gọi ngay</span>
            </a>
          </Button>
        ) : null}
      </div>
    </header>
  );
}
