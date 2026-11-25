import Link from "next/link";
import { FileText, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhone, telHref, zaloHref } from "@/lib/phone";
import { QUOTE_HREF } from "./nav-links";

/** Closing call-to-action band: quote, call, Zalo. */
export function QuoteCta({ hotline, zalo }: { hotline: string; zalo: string }) {
  const zaloNumber = zalo || hotline;
  return (
    <section aria-labelledby="cta-heading" className="bg-jade-700 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-6 md:py-16">
        <div className="max-w-2xl">
          <h2 id="cta-heading" className="text-white">
            Nhận tư vấn và báo giá miễn phí
          </h2>
          <p className="mt-3 text-jade-50">
            Gửi kích thước, ảnh khuôn viên hoặc mẫu Quý khách thích. Chúng tôi sẽ liên hệ lại để tư
            vấn chi tiết. Báo giá trọn gói nhưng không gồm phần móng.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:flex-col lg:flex-row">
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
                {formatPhone(hotline)}
              </a>
            </Button>
          ) : null}
          {zaloNumber ? (
            <Button asChild variant="zalo" size="lg">
              <a href={zaloHref(zaloNumber)} target="_blank" rel="noopener noreferrer">
                Nhắn Zalo
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
