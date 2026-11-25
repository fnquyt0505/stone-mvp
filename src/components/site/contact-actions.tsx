"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, FileText, Music2, Phone } from "lucide-react";
import { trackContactClick } from "@/lib/analytics";
import { formatPhone, telHref, zaloHref } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { QUOTE_HREF } from "./nav-links";

export type ContactInfo = { hotline: string; zalo: string; tiktok?: string };

const ROUND =
  "flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105";

function ZaloMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("text-sm font-bold tracking-tight", className)}>
      Zalo
    </span>
  );
}

function useShowBackToTop(threshold = 400) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return show;
}

/** Desktop (md+): round buttons stacked bottom-right. */
export function FloatingContact({ hotline, zalo, tiktok }: ContactInfo) {
  const showTop = useShowBackToTop();
  const zaloNumber = zalo || hotline;

  return (
    <div
      role="group"
      aria-label="Liên hệ nhanh"
      className="fixed right-5 bottom-6 z-30 hidden flex-col items-center gap-3 md:flex"
    >
      {hotline ? (
        <a
          href={telHref(hotline)}
          aria-label={`Gọi ngay ${formatPhone(hotline)}`}
          onClick={() => trackContactClick("call", "floating")}
          className={cn(ROUND, "bg-red-600 motion-safe:animate-ring")}
        >
          <Phone aria-hidden className="size-6" />
        </a>
      ) : null}
      {zaloNumber ? (
        <a
          href={zaloHref(zaloNumber)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Nhắn tin Zalo"
          onClick={() => trackContactClick("zalo", "floating")}
          className={cn(ROUND, "bg-zalo")}
        >
          <ZaloMark />
        </a>
      ) : null}
      {tiktok ? (
        <a
          href={tiktok}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Xem TikTok của chúng tôi"
          onClick={() => trackContactClick("tiktok", "floating")}
          className={cn(ROUND, "bg-stone-900")}
        >
          <Music2 aria-hidden className="size-6" />
        </a>
      ) : null}
      <button
        type="button"
        aria-label="Lên đầu trang"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          ROUND,
          "size-12 bg-stone-700 transition-opacity",
          showTop ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
      >
        <ArrowUp aria-hidden className="size-5" />
      </button>
    </div>
  );
}

const CELL =
  "flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-small font-semibold text-white";

/** Mobile (< md): fixed bottom bar with Gọi · Zalo · Báo giá. */
export function StickyBottomBar({ hotline, zalo }: ContactInfo) {
  const zaloNumber = zalo || hotline;

  return (
    <nav
      aria-label="Liên hệ nhanh"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-stone-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgb(0_0_0/0.08)] md:hidden"
    >
      {hotline ? (
        <a
          href={telHref(hotline)}
          onClick={() => trackContactClick("call", "bottom_bar")}
          className={cn(CELL, "bg-red-600")}
        >
          <Phone aria-hidden className="size-5" />
          Gọi ngay
        </a>
      ) : null}
      {zaloNumber ? (
        <a
          href={zaloHref(zaloNumber)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackContactClick("zalo", "bottom_bar")}
          className={cn(CELL, "bg-zalo")}
        >
          <ZaloMark className="text-base leading-5" />
          Nhắn Zalo
        </a>
      ) : null}
      <Link
        href={QUOTE_HREF}
        onClick={() => trackContactClick("quote", "bottom_bar")}
        className={cn(CELL, "bg-gold-600 text-stone-900")}
      >
        <FileText aria-hidden className="size-5" />
        Báo giá
      </Link>
    </nav>
  );
}
