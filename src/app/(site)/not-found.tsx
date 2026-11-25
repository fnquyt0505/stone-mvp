import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QUOTE_HREF } from "@/components/site/nav-links";

export default function SiteNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
      <p className="font-heading text-h2 font-bold text-gold-600">404</p>
      <h1 className="mt-2">Không tìm thấy trang</h1>
      <p className="mx-auto mt-4 max-w-prose text-stone-700">
        Trang Quý khách tìm có thể đã được đổi địa chỉ hoặc chưa có nội dung. Quý khách có thể quay
        về trang chủ hoặc liên hệ để được tư vấn trực tiếp.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">Về trang chủ</Link>
        </Button>
        <Button asChild variant="cta" size="lg">
          <Link href={QUOTE_HREF}>Nhận báo giá</Link>
        </Button>
      </div>
    </main>
  );
}
