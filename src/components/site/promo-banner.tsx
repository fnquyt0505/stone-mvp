import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { telHref } from "@/lib/phone";
import type { ActiveBanner } from "@/server/queries/site";

/** Admin-configured promo strip with a call-to-action (defaults to calling the hotline). */
export function PromoBanner({ banner, hotline }: { banner: ActiveBanner | null; hotline: string }) {
  if (!banner) return null;

  const href = banner.ctaHref || (hotline ? telHref(hotline) : null);
  const label = banner.ctaLabel || "Gọi ngay";
  const isCall = href?.startsWith("tel:") ?? false;

  return (
    <aside aria-label="Khuyến mãi" className="border-b border-gold-600/30 bg-jade-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-2 text-center sm:flex-row sm:justify-center sm:gap-4 md:px-6">
        <p className="text-small-responsive text-stone-900">
          <strong className="font-semibold">{banner.title}</strong>
          {banner.subtitle ? <span className="text-stone-700"> — {banner.subtitle}</span> : null}
        </p>
        {href ? (
          <Button asChild variant={isCall ? "call" : "cta"} size="sm" className="h-11 sm:h-9">
            <a href={href}>
              {isCall ? <Phone aria-hidden /> : null}
              {label}
            </a>
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
