import type { Metadata } from "next";
import { Info } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { QuoteCta } from "@/components/site/quote-cta";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { ORDER_STEPS } from "@/lib/order-process";
import { buildMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/server/queries/site";

export const revalidate = 3600;

const TITLE = "Hướng dẫn đặt hàng";
const DESCRIPTION =
  "7 bước đặt làm lăng mộ đá, nhà thờ họ: từ gửi yêu cầu, khảo sát, bản vẽ, báo giá trọn gói đến lắp đặt và nghiệm thu.";
const CRUMBS = [
  { name: "Trang chủ", path: "/" },
  { name: TITLE, path: "/huong-dan-dat-hang/" },
];

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/huong-dan-dat-hang/",
});

export default async function OrderGuidePage() {
  const settings = await getSiteSettings();
  return (
    <main>
      <div className="mx-auto max-w-3xl px-4 pt-6 pb-12 md:px-6 md:pb-20">
        <Breadcrumb items={CRUMBS} />
        <h1 className="mt-4">{TITLE}</h1>
        <p className="mt-4 text-lg text-stone-700">{DESCRIPTION}</p>

        <ol
          aria-label="Các bước đặt hàng"
          className="relative mt-10 space-y-8 border-l-2 border-gold-600/40 pl-8 md:pl-10"
        >
          {ORDER_STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <span
                aria-hidden
                className="absolute top-0 -left-[3.25rem] flex size-10 items-center justify-center rounded-full bg-gold-600 font-heading text-lg font-bold text-stone-900 md:-left-[3.75rem]"
              >
                {index + 1}
              </span>
              <h2 className="text-h3 md:text-h3-lg">
                <span className="sr-only">Bước {index + 1}: </span>
                {step.title}
              </h2>
              <p className="mt-2 text-stone-700">{step.description}</p>
            </li>
          ))}
        </ol>

        <aside
          aria-label="Lưu ý về báo giá"
          className="mt-12 flex gap-3 rounded-lg bg-jade-50 p-5 text-stone-900"
        >
          <Info aria-hidden className="mt-1 size-5 shrink-0 text-jade-700" />
          <p>
            <strong>Lưu ý:</strong> báo giá trọn gói nhưng không gồm phần móng. Phần móng được tư
            vấn riêng theo nền đất và khuôn viên thực tế.
          </p>
        </aside>
      </div>

      <QuoteCta hotline={settings.hotline} zalo={settings.zalo} />
      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
    </main>
  );
}
