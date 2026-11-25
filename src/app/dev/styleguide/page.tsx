import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Styleguide (nội bộ)",
  robots: { index: false, follow: false },
};

// Swatch classes are listed literally so Tailwind can detect them.
const COLORS = [
  { token: "stone-900", className: "bg-stone-900", use: "Chữ chính, header tối, footer" },
  { token: "stone-700", className: "bg-stone-700", use: "Chữ phụ, icon" },
  { token: "stone-500", className: "bg-stone-500", use: "Viền đậm, trang trí" },
  { token: "stone-200", className: "bg-stone-200", use: "Viền, đường kẻ" },
  { token: "stone-50", className: "bg-stone-50", use: "Nền section xen kẽ" },
  { token: "white", className: "bg-white", use: "Nền chính, thẻ" },
  { token: "jade-700", className: "bg-jade-700", use: "Màu thương hiệu, link" },
  { token: "jade-50", className: "bg-jade-50", use: "Nền khối thông tin" },
  { token: "gold-600", className: "bg-gold-600", use: "CTA chính, trang trí" },
  { token: "gold-700", className: "bg-gold-700", use: "Hover CTA" },
  { token: "red-600", className: "bg-red-600", use: "Nút Gọi ngay, lỗi form" },
  { token: "zalo", className: "bg-zalo", use: "Nút Zalo" },
  { token: "success", className: "bg-success", use: "Thông báo thành công" },
] as const;

export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto max-w-7xl space-y-16 px-4 py-12 md:px-6 md:py-20">
      <header>
        <h1>Styleguide</h1>
        <p className="text-muted-foreground mt-2">
          Token màu, chữ và nút theo docs/DESIGN.md. Trang nội bộ, chỉ có ở môi trường dev.
        </p>
      </header>

      <section aria-labelledby="sg-colors">
        <h2 id="sg-colors" className="section-ornament">
          Màu sắc
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {COLORS.map((c) => (
            <li key={c.token} className="overflow-hidden rounded-lg border shadow-sm">
              <div className={`h-20 ${c.className}`} />
              <div className="p-3">
                <p className="font-semibold">{c.token}</p>
                <p className="text-small-responsive text-muted-foreground">{c.use}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sg-type" className="space-y-4">
        <h2 id="sg-type" className="section-ornament">
          Chữ
        </h2>
        <p className="font-heading text-h1 md:text-h1-lg font-bold">H1 — Mộ đá đôi xanh rêu</p>
        <p className="font-heading text-h2 md:text-h2-lg font-semibold">H2 — Lăng thờ đá ba mái</p>
        <h3>H3 — Nhà thờ họ bằng đá</h3>
        <p className="max-w-prose">
          Nội dung (17px / 18px, Be Vietnam Pro): Chúng tôi nhận chế tác mộ cải táng, mộ an táng
          theo kích thước thước Lỗ Ban. Quý khách vui lòng liên hệ để nhận tư vấn và báo giá trọn
          gói (không gồm phần móng).
        </p>
        <p className="text-small-responsive text-muted-foreground">
          Chữ nhỏ (14px / 15px) — chú thích ảnh, breadcrumb.
        </p>
        <p>
          <a href="#sg-type" className="text-jade-700 underline underline-offset-4">
            Liên kết mẫu
          </a>
        </p>
      </section>

      <section aria-labelledby="sg-buttons" className="space-y-6">
        <h2 id="sg-buttons" className="section-ornament">
          Nút
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="cta" size="lg">
            Nhận báo giá
          </Button>
          <Button variant="call" size="lg">
            Gọi ngay
          </Button>
          <Button variant="zalo" size="lg">
            Nhắn Zalo
          </Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button>Mặc định (admin)</Button>
          <Button variant="outline">Viền</Button>
          <Button variant="secondary">Phụ</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Xem mẫu →</Button>
          <Button disabled>Vô hiệu</Button>
        </div>
      </section>
    </main>
  );
}
