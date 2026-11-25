import { Phone } from "lucide-react";
import { formatPhone, telHref, zaloHref } from "@/lib/phone";
import { toQuoteCategoryOptions } from "@/lib/quote-options";
import { getMenuCategories } from "@/server/queries/categories";
import { getSiteSettings } from "@/server/queries/site";
import { getTurnstileSiteKey } from "@/server/turnstile";
import { QuoteForm } from "./quote-form";

/**
 * "Nhận báo giá" section with the quote form and direct contact options.
 * Rendered at #bao-gia (QUOTE_HREF target) on contact and category pages.
 */
export async function QuoteSection({
  defaultCategoryId,
  idPrefix,
}: {
  defaultCategoryId?: string;
  idPrefix?: string;
}) {
  const [menu, settings] = await Promise.all([getMenuCategories(), getSiteSettings()]);
  const categories = toQuoteCategoryOptions(menu);
  const zaloNumber = settings.zalo || settings.hotline;

  return (
    <section
      id="bao-gia"
      aria-labelledby="bao-gia-heading"
      className="scroll-mt-24 bg-stone-50 py-12 md:py-20"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border bg-white p-5 shadow-sm md:p-8">
          <h2 id="bao-gia-heading" className="section-ornament">
            Nhận báo giá miễn phí
          </h2>
          <p className="mt-4 mb-6 text-stone-700">
            Để lại thông tin, chúng tôi sẽ gọi lại tư vấn mẫu, kích thước Lỗ Ban và báo giá trọn
            gói.
          </p>
          <QuoteForm
            categories={categories}
            defaultCategoryId={defaultCategoryId}
            turnstileSiteKey={getTurnstileSiteKey()}
            idPrefix={idPrefix}
          />
        </div>
        <aside aria-label="Liên hệ trực tiếp" className="grid content-start gap-4">
          <p className="font-heading text-h3 font-semibold">Cần tư vấn ngay?</p>
          {settings.hotline ? (
            <a
              href={telHref(settings.hotline)}
              className="flex min-h-14 items-center gap-3 rounded-lg bg-red-600 px-5 text-lg font-semibold text-white hover:bg-red-600/90"
            >
              <Phone aria-hidden className="size-5" />
              Gọi {formatPhone(settings.hotline)}
            </a>
          ) : null}
          {zaloNumber ? (
            <a
              href={zaloHref(zaloNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-14 items-center gap-3 rounded-lg bg-zalo px-5 text-lg font-semibold text-white hover:bg-zalo/90"
            >
              Nhắn Zalo
            </a>
          ) : null}
          {settings.workingHours ? (
            <p className="text-stone-700">Giờ làm việc: {settings.workingHours}</p>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
