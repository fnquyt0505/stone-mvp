import Image from "next/image";
import Link from "next/link";
import { FileText, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhone, telHref } from "@/lib/phone";
import type { CardImage } from "@/server/queries/home";
import { QUOTE_HREF } from "./nav-links";

/**
 * Full-width hero: project photo with a 40% dark overlay, H1 and two CTAs.
 * Without a photo it falls back to a dark stone gradient.
 */
export function Hero({
  title,
  lead,
  hotline,
  image,
}: {
  title: string;
  lead: string;
  hotline: string;
  image: CardImage | null;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-stone-900 text-white">
      {image ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--color-jade-700),transparent_60%),linear-gradient(135deg,var(--color-stone-900),var(--color-stone-700))]"
        />
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-stone-900/40" />

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-28">
        <div className="max-w-2xl">
          <h1 className="text-white">{title}</h1>
          <span aria-hidden className="mt-4 block h-0.5 w-12 bg-gold-600" />
          <p className="mt-5 text-lg text-stone-50 md:text-xl">{lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="cta" size="lg">
              <Link href={QUOTE_HREF}>
                <FileText aria-hidden />
                Nhận báo giá
              </Link>
            </Button>
            {hotline ? (
              <Button asChild variant="call" size="lg">
                <a href={telHref(hotline)}>
                  <Phone aria-hidden />
                  Gọi ngay {formatPhone(hotline)}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
