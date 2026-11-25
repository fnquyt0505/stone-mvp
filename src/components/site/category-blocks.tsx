import { Phone, UserRound } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatPriceRange } from "@/lib/format-price";
import { formatPhone, telHref, zaloHref } from "@/lib/phone";
import type { Faq, Spec } from "@/schemas/category";

/** Jade info box with the reference price range and quick contact buttons. */
export function PriceRange({
  from,
  to,
  hotline,
  zalo,
}: {
  from: number | null;
  to: number | null;
  hotline: string;
  zalo: string;
}) {
  const zaloNumber = zalo || hotline;
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-jade-50 p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-stone-700">Giá tham khảo</p>
        <p className="font-heading text-h2 font-bold text-jade-700">{formatPriceRange(from, to)}</p>
        <p className="text-small-responsive text-stone-700">
          Báo giá trọn gói nhưng không gồm phần móng. Giá thực tế theo kích thước và chất liệu.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        {zaloNumber ? (
          <Button asChild variant="zalo" size="lg">
            <a href={zaloHref(zaloNumber)} target="_blank" rel="noopener noreferrer">
              Hỏi giá qua Zalo
            </a>
          </Button>
        ) : null}
        {hotline ? (
          <Button asChild variant="call" size="lg">
            <a href={telHref(hotline)}>
              <Phone aria-hidden />
              {formatPhone(hotline)}
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** Two-column label/value table with alternating stone-50 rows. */
export function SpecTable({ specs, caption }: { specs: Spec[]; caption: string }) {
  if (!specs.length) return null;
  return (
    <table className="w-full overflow-hidden rounded-lg border text-left">
      <caption className="sr-only">{caption}</caption>
      <tbody>
        {specs.map((s) => (
          <tr key={s.label} className="border-b last:border-b-0 even:bg-stone-50">
            <th scope="row" className="w-2/5 p-3 align-top font-semibold text-stone-900 md:p-4">
              {s.label}
            </th>
            <td className="p-3 text-stone-700 md:p-4">{s.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** FAQ accordion; only one item open at a time. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <Accordion type="single" collapsible className="rounded-lg border bg-white px-4 md:px-6">
      {faqs.map((f, i) => (
        <AccordionItem key={f.q} value={`faq-${i}`}>
          <AccordionTrigger className="py-4 text-left text-lg font-semibold hover:no-underline">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="text-base text-stone-700 md:text-body-lg">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export type Author = { name: string; role: string; bio: string };

/** Author credit for E-E-A-T. */
export function AuthorBox({ author, updatedAt }: { author: Author; updatedAt: string }) {
  return (
    <aside
      aria-label="Tác giả"
      className="flex gap-4 rounded-lg border bg-stone-50 p-5 md:items-center"
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-jade-700 text-white">
        <UserRound aria-hidden className="size-7" />
      </span>
      <div>
        <p className="font-semibold text-stone-900">
          Biên soạn: {author.name}
          {author.role ? (
            <span className="font-normal text-stone-700"> — {author.role}</span>
          ) : null}
        </p>
        {author.bio ? <p className="mt-1 text-stone-700">{author.bio}</p> : null}
        <p className="mt-1 text-small-responsive text-stone-700">
          Cập nhật ngày{" "}
          <time dateTime={updatedAt}>
            {new Date(updatedAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
          </time>
        </p>
      </div>
    </aside>
  );
}
