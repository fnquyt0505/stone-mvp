import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/jsonld";

/**
 * Small breadcrumb trail separated by "/". Uses stone-700 rather than
 * DESIGN.md's stone-500 so small text meets WCAG AA (see PROGRESS T02).
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Đường dẫn" className="text-small-responsive text-stone-700">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="font-medium text-stone-900">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className="py-2 hover:text-jade-700 hover:underline">
                    {item.name}
                  </Link>
                  <span aria-hidden>/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
