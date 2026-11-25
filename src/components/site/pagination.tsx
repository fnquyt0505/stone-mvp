import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_LINK =
  "inline-flex size-12 items-center justify-center rounded-md border font-semibold hover:border-jade-700 hover:text-jade-700";

/** Numbered pagination with 48px touch targets; `hrefFor` builds each page URL. */
export function Pagination({
  page,
  pages,
  hrefFor,
}: {
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
}) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Phân trang" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={PAGE_LINK} aria-label="Trang trước" rel="prev">
          <ChevronLeft aria-hidden className="size-5" />
        </Link>
      ) : null}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          aria-current={n === page ? "page" : undefined}
          aria-label={`Trang ${n}`}
          className={cn(
            PAGE_LINK,
            n === page && "border-jade-700 bg-jade-700 text-white hover:text-white",
          )}
        >
          {n}
        </Link>
      ))}
      {page < pages ? (
        <Link href={hrefFor(page + 1)} className={PAGE_LINK} aria-label="Trang sau" rel="next">
          <ChevronRight aria-hidden className="size-5" />
        </Link>
      ) : null}
    </nav>
  );
}
