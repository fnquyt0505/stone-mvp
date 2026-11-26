# TASKS

Làm theo thứ tự. Mỗi task đủ nhỏ để xong trong một phiên, có tiêu chí "Xong khi" để kiểm tra. Đánh dấu `[x]` khi hoàn thành và ghi vào PROGRESS.md.

## Giai đoạn 0 — Nền móng
- [x] **T01 Khởi tạo dự án**: Next.js 15 + TS + Tailwind v4 + ESLint + Prettier, pnpm, cấu trúc thư mục theo ARCHITECTURE.md, `.env.example`.
  _Xong khi:_ `pnpm dev` chạy, `pnpm lint && pnpm typecheck` sạch.
- [x] **T02 Design tokens & font**: khai báo màu, font Lora + Be Vietnam Pro (subset vietnamese), thang chữ trong DESIGN.md; cài shadcn/ui.
  _Xong khi:_ trang `/dev/styleguide` hiển thị màu, heading, nút.
- [x] **T03 Database & Prisma**: schema đầy đủ theo ARCHITECTURE.md §3, migration đầu tiên, `server/db.ts`.
  _Xong khi:_ `prisma migrate dev` chạy, Prisma Studio thấy đủ bảng.
- [x] **T04 Seed dữ liệu mẫu**: 6 nhóm danh mục + ~15 danh mục con, 6 công trình, 3 đánh giá, 3 bài viết, 1 banner, cài đặt site, 1 admin. Mọi nội dung đánh dấu `[MẪU]`.
  _Xong khi:_ `pnpm db:seed` chạy lại nhiều lần không lỗi.
- [x] **T05 Tiện ích chung**: `slugify` (tiếng Việt), `formatPriceRange`, helper metadata SEO, helper JSON-LD + unit test.
  _Xong khi:_ test `slugify("Mộ Đá Đôi") === "mo-da-doi"` pass.

## Giai đoạn 1 — Khung site công khai
- [x] **T06 Layout site**: TopBar, PromoBanner, Header dính, Footer (dữ liệu từ SiteSetting).
- [x] **T07 MegaMenu**: desktop dropdown nhiều cột; mobile drawer accordion; dữ liệu từ Category 2 cấp.
  _Xong khi:_ điều hướng được bằng bàn phím, đóng bằng Esc.
- [x] **T08 FloatingContact + StickyBottomBar**: Gọi (`tel:`), Zalo (`https://zalo.me/<sđt>`), TikTok, lên đầu; bắn event GA.
- [x] **T09 Trang chủ**: Hero, lưới danh mục, công trình tiêu biểu, ProcessSteps, testimonial, khối thành tích, CTA báo giá.

## Giai đoạn 2 — Nội dung cốt lõi
- [x] **T10 Route `/[slug]`**: resolve Category hoặc Page; 404 nếu không có; `generateStaticParams`.
- [x] **T11 Trang danh mục**: Breadcrumb, H1, PriceRange, rich text, SpecTable, Gallery + lightbox, FAQ, danh mục liên quan, AuthorBox, QuoteForm; JSON-LD Breadcrumb + FAQPage.
  _Xong khi:_ Lighthouse mobile SEO ≥ 95 trên trang mẫu `/mo-da-doi/`. — ✅ Đo 26/11 (chủ dự án, Chrome, mobile, bản production): SEO 100 · Accessibility 100 · Performance 99 · Best Practices 96.
- [x] **T12 Công trình**: danh sách có lọc tỉnh/loại (query string), phân trang; trang chi tiết có gallery.
- [x] **T13 Blog & thư viện ảnh**: `/tin-tuc`, `/tin-tuc/[slug]` (Article JSON-LD), `/thu-vien-hinh-anh`.
- [x] **T14 Trang tĩnh**: Giới thiệu, Hướng dẫn đặt hàng (timeline 7 bước), Liên hệ (bản đồ + form), các trang chính sách.

## Giai đoạn 3 — Thu lead
- [x] **T15 QuoteForm + Server Action `submitLead`**: Zod (SĐT VN), honeypot, Turnstile, rate limit, lưu Lead, trạng thái thành công/lỗi.
  _Xong khi:_ gửi form tạo bản ghi Lead; gửi 6 lần liên tiếp bị chặn.
- [x] **T16 Thông báo lead**: email Resend (+ Telegram tùy chọn), lỗi không làm hỏng việc lưu.
- [x] **T17 Popup báo giá**: mở từ CTA bất kỳ, tự điền loại sản phẩm theo trang đang xem, lưu `sourceUrl` + UTM.

## Giai đoạn 4 — Admin
- [x] **T18 Auth admin**: Auth.js Credentials, trang login, middleware + `requireAdmin()`.
- [x] **T19 Khung admin**: sidebar, dashboard (lead mới hôm nay/tuần, tổng nội dung).
- [x] **T20 Quản lý Lead**: bảng lọc theo trạng thái/ngày, đổi trạng thái, ghi chú, bấm gọi; xuất CSV.
- [x] **T21 Upload ảnh**: `/api/upload` ký Cloudinary, ImageUploader kéo-thả nhiều ảnh, bắt buộc alt.
- [x] **T22 Rich text editor**: Tiptap (heading, list, bảng, ảnh, link) + renderer phía site đã sanitize.
- [x] **T23 CRUD Danh mục**: cha/con, thứ tự, specs, FAQs, gallery sắp xếp kéo-thả, SEO; kiểm tra slug trùng với Page; `revalidateTag`.
- [x] **T24 CRUD Công trình, Bài viết, Trang tĩnh**.
- [x] **T25 CRUD Đánh giá, Banner, Cài đặt site**.

## Giai đoạn 5 — Hoàn thiện & ra mắt
- [ ] **T26 SEO kỹ thuật**: `sitemap.ts`, `robots.ts`, LocalBusiness JSON-LD, canonical, OG image mặc định, redirect 301 cho slug cũ (nếu migrate).
- [ ] **T27 Hiệu năng & truy cập**: Lighthouse mobile ≥ 85 perf / ≥ 95 SEO & a11y trên 4 trang chính; sửa lỗi.
- [ ] **T28 Test E2E (Playwright)**: xem danh mục → gửi báo giá → lead xuất hiện trong admin → đổi trạng thái.
- [ ] **T29 Deploy**: Vercel + Postgres production + biến môi trường + domain; GA4.
- [ ] **T30 Bàn giao**: README hướng dẫn admin, cập nhật PROGRESS.md.

## Backlog (sau MVP)
- [ ] Công cụ tra kích thước Lỗ Ban
- [ ] Tìm kiếm toàn site
- [ ] Bảng giá tải về (PDF)
- [ ] Nhiều chi nhánh / hotline theo vùng
- [ ] Import nội dung từ WordPress cũ
