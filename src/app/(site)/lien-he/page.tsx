import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { QuoteSection } from "@/components/site/quote-section";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { formatPhone, telHref, zaloHref } from "@/lib/phone";
import { buildMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/server/queries/site";

export const revalidate = 3600;

const TITLE = "Liên hệ";
const DESCRIPTION =
  "Gọi điện, nhắn Zalo hoặc gửi yêu cầu báo giá. Chúng tôi tư vấn mẫu, kích thước Lỗ Ban và báo giá trọn gói.";
const CRUMBS = [
  { name: "Trang chủ", path: "/" },
  { name: TITLE, path: "/lien-he/" },
];

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/lien-he/",
});

const ROW = "flex gap-4 rounded-lg border bg-white p-5";
const ICON = "mt-0.5 size-6 shrink-0 text-gold-600";

export default async function ContactPage() {
  const s = await getSiteSettings();
  const zaloNumber = s.zalo || s.hotline;

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 md:px-6 md:pb-20">
        <Breadcrumb items={CRUMBS} />
        <h1 className="mt-4">{TITLE}</h1>
        <p className="mt-4 max-w-prose text-lg text-stone-700">{DESCRIPTION}</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <ul className="grid content-start gap-4" aria-label="Thông tin liên hệ">
            {s.hotline ? (
              <li className={ROW}>
                <Phone aria-hidden className={ICON} />
                <div>
                  <p className="font-semibold">Hotline</p>
                  <a
                    href={telHref(s.hotline)}
                    className="text-h3 font-bold text-red-600 hover:underline"
                  >
                    {formatPhone(s.hotline)}
                  </a>
                </div>
              </li>
            ) : null}
            {zaloNumber ? (
              <li className={ROW}>
                <MessageCircle aria-hidden className={ICON} />
                <div>
                  <p className="font-semibold">Zalo</p>
                  <a
                    href={zaloHref(zaloNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-zalo hover:underline"
                  >
                    Nhắn Zalo {formatPhone(zaloNumber)}
                  </a>
                </div>
              </li>
            ) : null}
            {s.email ? (
              <li className={ROW}>
                <Mail aria-hidden className={ICON} />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href={`mailto:${s.email}`} className="text-jade-700 hover:underline">
                    {s.email}
                  </a>
                </div>
              </li>
            ) : null}
            {s.address ? (
              <li className={ROW}>
                <MapPin aria-hidden className={ICON} />
                <div>
                  <p className="font-semibold">Địa chỉ xưởng</p>
                  <p className="text-stone-700">{s.address}</p>
                </div>
              </li>
            ) : null}
            {s.workingHours ? (
              <li className={ROW}>
                <Clock aria-hidden className={ICON} />
                <div>
                  <p className="font-semibold">Giờ làm việc</p>
                  <p className="text-stone-700">{s.workingHours}</p>
                </div>
              </li>
            ) : null}
          </ul>

          <section aria-labelledby="contact-map">
            <h2 id="contact-map" className="sr-only">
              Bản đồ
            </h2>
            {s.mapEmbedUrl ? (
              <iframe
                src={s.mapEmbedUrl}
                title={`Bản đồ đường đến ${s.brandName}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[4/3] w-full rounded-lg border"
              />
            ) : (
              <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border bg-stone-50 p-6 text-center text-stone-700">
                <MapPin aria-hidden className="size-8 text-gold-600" />
                <p>Bản đồ sẽ hiển thị khi có địa chỉ xưởng chính thức.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      <QuoteSection idPrefix="contact-quote" />
      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
    </main>
  );
}
