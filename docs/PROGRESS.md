# PROGRESS

> Cập nhật sau **mỗi** task. Mục mới nhất ở trên cùng. Giữ ngắn gọn, đủ để người/AI khác tiếp tục ngay.

## Trạng thái hiện tại
- **Giai đoạn:** 4 — Admin
- **Task đang làm:** —
- **Task tiếp theo:** T21 Upload ảnh
- **Chặn bởi:** Cần chủ dự án chốt tên thương hiệu, logo, hotline, Zalo, địa chỉ (có thể dùng `[MẪU]` để làm trước).

## Tổng quan
| Giai đoạn | Task | Xong |
|---|---|---|
| 0 Nền móng | T01–T05 | 5/5 |
| 1 Khung site | T06–T09 | 4/4 |
| 2 Nội dung | T10–T14 | 5/5 |
| 3 Thu lead | T15–T17 | 3/3 |
| 4 Admin | T18–T25 | 3/8 |
| 5 Ra mắt | T26–T30 | 0/5 |

## Nhật ký

### 2026-11-26 — T20 Quản lý Lead
- ✅ Đã xong: `/admin/leads/`: lọc theo trạng thái, từ ngày / đến ngày (ranh giới ngày giờ VN), tìm tên hoặc SĐT (nhận cả "0987 654"), 20 lead/trang, mỗi lead có nút **gọi** (tel:+84), badge trạng thái, trích yêu cầu + ghi chú. `/admin/leads/[id]/`: đủ thông tin (thời gian, tỉnh, loại sản phẩm, yêu cầu, trang gửi, UTM), nút Gọi + Zalo, form đổi **trạng thái** (radio to, 5 trạng thái) + **ghi chú nội bộ** qua Server Action `updateLead` (`requireStaff` + Zod). **Xuất CSV** `/admin/leads/export/` theo đúng bộ lọc (BOM UTF-8, CRLF, chống CSV injection, SĐT dạng "0987 654 321" để Excel giữ số 0, tối đa 10.000 dòng; `requireStaff`). 8 unit + 3 e2e mới → 102 unit + 111 e2e pass.
- 📁 File thay đổi: `src/app/admin/(panel)/leads/{page.tsx,[id]/page.tsx,[id]/lead-edit-form.tsx}`, `src/app/admin/leads/export/route.ts`, `src/server/{queries/admin-leads,actions/admin-lead}.ts`, `src/schemas/admin-lead.ts`, `src/lib/{csv,vn-time}.ts`, `tests/unit/admin-leads.test.ts`, `tests/e2e/admin-leads.spec.ts`.
- 🐞 Lỗi / vấn đề: không có.
- 🧠 Quyết định quan trọng: không có thao tác xóa lead trong admin (tránh mất dữ liệu); lead không còn quan tâm thì chuyển "Hủy".
- ⏭️ Bước tiếp theo: T21.

### 2026-11-26 — T19 Khung admin
- ✅ Đã xong: khung `/admin/(panel)`: header dính (Xem website, tên, Đăng xuất), **sidebar** desktop (9 mục, `aria-current`, icon + chữ) và **menu trượt** mobile (tự đóng khi chọn); mục Cài đặt chỉ hiện với ADMIN (`navForRole`). **Dashboard**: lead mới hôm nay / 7 ngày / đang "Mới" (theo giờ VN, `lib/vn-time.ts`), 5 lead gần nhất (badge trạng thái chữ + màu, nút gọi), số nội dung đang hiển thị. `LeadStatusBadge` + nhãn trạng thái tiếng Việt dùng chung. Trang tạm cho các mục T20–T25 (đều `requireStaff`/`requireAdmin`). Rate limit đăng nhập giờ **chỉ đếm lần sai** (`isRateLimited` + `recordHit`). Helper e2e `loginAsAdmin`. 94 unit + 108 e2e pass.
- 📁 File thay đổi: `src/app/admin/(panel)/{layout,page}.tsx` + 8 trang tạm, `src/components/admin/{admin-nav,admin-sidebar,lead-status,coming-soon}.tsx|ts`, `src/server/queries/admin-stats.ts`, `src/lib/vn-time.ts`, `src/server/{rate-limit,actions/auth}.ts`, `tests/unit/admin-shell.test.ts`, `tests/e2e/{admin-shell.spec.ts,helpers/auth.ts}`.
- 🐞 Lỗi / vấn đề: rate limit đăng nhập trước đó đếm cả lần thành công → nhân viên có thể bị khóa oan; đã sửa.
- 🧠 Quyết định quan trọng: số liệu dashboard không cache (luôn mới).
- ⏭️ Bước tiếp theo: T20.

### 2026-11-26 — T18 Auth admin
- ✅ Đã xong: **Auth.js v5** (`next-auth@5.0.0-beta.32`) Credentials + JWT 12 giờ. `auth.config.ts` (edge-safe, callback đưa `id`/`role` vào session) + `auth.ts` (Prisma + bcryptjs; email lạ vẫn so với hash giả để không lộ tài khoản nào tồn tại). `middleware.ts`: giữ chuyển hướng chữ thường + chặn `/admin/*` khi chưa đăng nhập (→ `/admin/login/?next=…`), đã đăng nhập vào trang login → `/admin/`, header `X-Robots-Tag: noindex` + `Cache-Control: private, no-store`. `server/auth-guard.ts`: **`requireStaff()`** (ADMIN|EDITOR) / **`requireAdmin()`** kiểm tra lại ở server. `server/actions/auth.ts`: `login` (Zod, rate limit 10 lần/15 phút theo IP và theo email, `next` chỉ nhận đường dẫn trong `/admin/`) và `logout`. Trang `/admin/login/` tiếng Việt; khung `/admin/(panel)` tạm (T19 làm sidebar). E2E `admin-auth.spec.ts` 4 test (chưa đăng nhập bị chuyển hướng, sai mật khẩu, đăng nhập/đăng xuất, khóa sau 10 lần sai). 91 unit + 102 e2e pass.
- 📁 File thay đổi: `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`, `src/server/{auth-guard,actions/auth}.ts`, `src/schemas/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/admin/{layout.tsx,login/*,(panel)/*}`, `.github/workflows/ci.yml` (AUTH_SECRET giả cho CI), `package.json`.
- 🐞 Lỗi / vấn đề: phần tử thông báo chuyển trang của Next cũng có `role=alert` → test giới hạn trong form.
- 🧠 Quyết định quan trọng: Auth.js v5 vẫn là bản beta (đúng ARCHITECTURE, ghim phiên bản). `AUTH_SECRET` local sinh ngẫu nhiên trong `.env`; **production phải đặt AUTH_SECRET riêng** (T29).
- ⏭️ Bước tiếp theo: T19.

### 2026-11-26 — T17 Popup báo giá
- ✅ Đã xong: `QuoteDialog` (shadcn Dialog) gắn một lần trong layout site; listener **pha capture** trên `document` bắt mọi click vào link `/lien-he/#bao-gia` hoặc phần tử `[data-open-quote]` → mở popup, không rời trang (Ctrl/Cmd/Shift-click giữ hành vi link; không có JS thì link tới form trang Liên hệ). Trang danh mục báo loại sản phẩm qua store client `quote-context.ts` (`QuoteCategory`) → popup **tự chọn sẵn loại sản phẩm**; form mới mỗi lần mở; sourceUrl + UTM giữ từ T15. Event GA `contact_click` (quote) cho mọi CTA. Nút đóng dialog 44×44px, nhãn "Đóng"; `lib/quote-options.ts` dùng chung. E2E `quote-popup.spec.ts` (mở từ hero, gửi lead với sourceUrl "/", Esc đóng; mobile: bottom bar trên `/mo-da-doi/` chọn sẵn "Mộ đá đôi"; Ctrl-click mở trang Liên hệ). 91 unit + 98 e2e pass.
- 📁 File thay đổi: `src/components/site/{quote-dialog,quote-context,quote-section,category-view,contact-actions}.tsx|ts`, `src/components/ui/dialog.tsx`, `src/lib/quote-options.ts`, `src/app/(site)/layout.tsx`, `tests/e2e/quote-popup.spec.ts`.
- 🐞 Lỗi / vấn đề: `next/link` tự preventDefault + điều hướng trước listener bubble → chuyển listener sang capture.
- 🧠 Quyết định quan trọng: popup mở ở mọi trang (kể cả trang có form tại chỗ) cho thống nhất.
- ⏭️ Bước tiếp theo: T18 (giai đoạn 4 — Admin).

### 2026-11-26 — T16 Thông báo lead
- ✅ Đã xong: `server/notify.ts`: email qua **Resend REST API** (`RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL` nhiều người nhận cách nhau dấu phẩy, `LEAD_NOTIFY_FROM` mới — mặc định người gửi test của Resend) + **Telegram** tùy chọn (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`); timeout 8 giây; chưa cấu hình → bỏ qua. `lib/lead-notification.ts` dựng nội dung (họ tên, SĐT + link gọi, tỉnh, loại sản phẩm, ghi chú, trang gửi, UTM, giờ VN, link danh sách lead) và **escape HTML** dữ liệu khách nhập. `submitLead` gọi `notifyNewLead` trong `after()` — chạy sau khi đã trả kết quả cho khách; `notifyNewLead` không bao giờ ném lỗi, chỉ log (SĐT che `091****678`). Vitest alias `server-only` → stub để test được module server. 5 unit test mới (91 tổng) + 95 e2e pass.
- 📁 File thay đổi: `src/server/notify.ts`, `src/lib/lead-notification.ts`, `src/server/actions/lead.ts`, `vitest.config.ts`, `tests/stubs/server-only.ts`, `tests/unit/notify.test.ts`, `.env.example`, `docs/ARCHITECTURE.md` (thêm `LEAD_NOTIFY_FROM?`).
- 🐞 Lỗi / vấn đề: không có. Chưa gửi thử email/Telegram thật (chưa có key) — kiểm tra bằng fetch giả.
- 🧠 Quyết định quan trọng: dùng REST API thay SDK Resend (không thêm thư viện). **Cần chủ xưởng:** tạo tài khoản Resend + xác minh tên miền gửi; (tùy chọn) tạo bot Telegram và lấy chat id.
- ⏭️ Bước tiếp theo: T17.

### 2026-11-26 — T15 QuoteForm + Server Action `submitLead`
- ✅ Đã xong: `server/actions/lead.ts` `submitLead`: honeypot (bot → báo thành công giả, không lưu) → Zod `schemas/lead.ts` (họ tên; SĐT VN di động/cố định, nhận +84; 34 tỉnh/thành hiện hành `lib/provinces.ts`; categoryId; ghi chú ≤ 1000; `sourceUrl` chỉ nhận path cùng site; UTM) → **Turnstile** (`server/turnstile.ts`, xác minh server) → **rate limit DB** (`server/rate-limit.ts`, bảng mới `RateLimitHit`, migration `add_rate_limit_hits`; 5 lần/10 phút/IP + 5 lần/ngày/SĐT; chỉ lưu hash có salt) → lưu Lead (NEW). Log lỗi che SĐT. Client `QuoteForm` (chạy được không cần JS, `useActionState`, thông báo `role=status` + focus, lỗi từng ô bằng `aria-invalid`/`aria-describedby`, **giữ nguyên dữ liệu đã nhập khi lỗi**, giữ trang nguồn + UTM first-touch qua sessionStorage, event GA `generate_lead`), `TurnstileWidget` (render tường minh), `QuoteSection` tại `#bao-gia` trên trang Liên hệ và trang danh mục (tự chọn loại sản phẩm). E2E `lead.spec.ts`: lỗi tiếng Việt, lưu lead (danh mục, tỉnh, sourceUrl, UTM kiểm tra trực tiếp trong DB), honeypot, **lần gửi thứ 6 bị chặn**, giữ dữ liệu khi lỗi rồi gửi lại thành công. 86 unit + 95 e2e pass.
- 📁 File thay đổi: `prisma/schema.prisma` + migration, `src/server/{actions/lead,rate-limit,turnstile}.ts`, `src/schemas/lead.ts`, `src/lib/{provinces,utm}.ts`, `src/components/site/{quote-form,quote-section,turnstile-widget,category-view}.tsx`, `src/app/(site)/lien-he/page.tsx`, `.env.example`, `tests/unit/lead-schema.test.ts`, `tests/e2e/lead.spec.ts`.
- 🐞 Lỗi / vấn đề: (1) React 19 tự reset form sau action → mất dữ liệu đã nhập khi lỗi; sửa bằng trả lại giá trị và dùng làm `defaultValue` (select cần `key` để mount lại); ô ẩn sourceUrl/UTM chuyển sang state. (2) Token Turnstile dùng 1 lần → reset sau mỗi lần gửi; câu báo lỗi đổi thành "bấm gửi lại sau giây lát".
- 🧠 Quyết định quan trọng: rate limit chỉ đếm lần gửi **hợp lệ** (người dùng gõ sai SĐT không bị khóa). Thiếu `TURNSTILE_SECRET_KEY` → bỏ qua xác minh + log lỗi (không chặn toàn bộ lead); **production bắt buộc đặt key thật**. Local dùng key test chính thức của Cloudflare. Trường "Ảnh tham khảo" chưa làm — cần upload Cloudinary (T21), bổ sung sau. Rate limit theo `x-forwarded-for` (Vercel ghi đè header này nên không giả mạo được).
- ⏭️ Bước tiếp theo: T16.

### 2026-11-26 — T14 Trang tĩnh
- ✅ Đã xong: 5 trang Page trong DB (Giới thiệu + 4 chính sách) seed nội dung `[MẪU]`, hiển thị qua `/[slug]` bằng `StaticPageView` (Breadcrumb, H1, ngày cập nhật, nội dung, JSON-LD). `/huong-dan-dat-hang/` timeline dọc 7 bước (`ORDER_STEPS`) + hộp lưu ý "báo giá trọn gói nhưng không gồm phần móng". `/lien-he/`: Hotline, Zalo, email, địa chỉ, giờ làm; bản đồ Google Maps nhúng từ SiteSetting `mapEmbedUrl` (chỉ chấp nhận `https://www.google.com/maps/embed…`), chưa có → ô ghi chú; vùng `#bao-gia` chờ form T15. Test e2e mới: 5 trang tĩnh, 7 bước, trang liên hệ, **mọi link header/footer trả 200**; SEO check mở rộng 11 trang. 68 unit + 86 e2e pass.
- 📁 File thay đổi: `src/app/(site)/{huong-dan-dat-hang,lien-he}/page.tsx`, `src/components/site/static-page-view.tsx`, `src/app/(site)/[slug]/page.tsx`, `src/schemas/site-settings.ts`, `prisma/{seed,seed-data}.ts`, `tests/unit/seed-data.test.ts`, `tests/e2e/{static-pages,seo-basics}.spec.ts`.
- 🐞 Lỗi / vấn đề: không có.
- 🧠 Quyết định quan trọng: **nội dung pháp lý (bảo mật, điều khoản, cookie, miễn trừ) chỉ là khung mẫu — chủ xưởng cần nhờ người có chuyên môn rà soát trước khi ra mắt.** Bản đồ cần chủ xưởng lấy link "Nhúng bản đồ" trên Google Maps.
- ⏭️ Bước tiếp theo: T15 (giai đoạn 3).

### 2026-11-26 — T13 Blog & thư viện ảnh
- ✅ Đã xong: `/tin-tuc/` (PostCard 3:2, mới nhất trước, phân trang 9/trang, trang ≥ 2 `noindex,follow`); `/tin-tuc/[slug]/` (Breadcrumb, H1, ngày + tác giả, tóm tắt, ảnh bìa, nội dung, 3 bài khác, CTA, JSON-LD **Article** + BreadcrumbList, `generateStaticParams`); chỉ hiện bài có `publishedAt` ≤ hiện tại (cache 10 phút để bài hẹn giờ tự lên). `/thu-vien-hinh-anh/`: mọi ảnh dùng trong gallery danh mục/công trình đã xuất bản, mỗi ảnh một lần, kèm chú thích + link "Xem: …" về trang nguồn, lightbox, 24 ảnh/trang. Tách `components/site/pagination.tsx` + `lib/pagination.ts` dùng chung (Công trình cũng dùng). Seed: ảnh bìa + nội dung dài hơn cho bài viết. Test SEO mở rộng ra 8 trang. 68 unit + 65 e2e pass.
- 📁 File thay đổi: `src/app/(site)/tin-tuc/{page.tsx,[slug]/page.tsx}`, `src/app/(site)/thu-vien-hinh-anh/page.tsx`, `src/server/queries/{posts,gallery}.ts`, `src/components/site/{pagination,gallery,cards,project-list-controls}.tsx`, `src/lib/pagination.ts`, `src/app/(site)/cong-trinh/page.tsx`, `prisma/seed.ts`, `tests/unit/pagination.test.ts`, `tests/e2e/{blog-gallery,seo-basics}.spec.ts`.
- 🐞 Lỗi / vấn đề: không có.
- 🧠 Quyết định quan trọng: thư viện ảnh lấy từ gallery có sẵn (không cần quản lý riêng); "Thư viện thiết kế" của site tham chiếu không làm trong MVP.
- ⏭️ Bước tiếp theo: T14.

### 2026-11-26 — T12 Công trình (+ T11 đạt Lighthouse)
- ✅ T11: chủ dự án đo Lighthouse mobile bản production `/mo-da-doi/`: **SEO 100**, Accessibility 100, Performance 99, Best Practices 96 → đánh dấu xong.
- ✅ T12: `/cong-trinh/` danh sách, lọc theo tỉnh (`?tinh=`) và nhóm danh mục (`?loai=`, gồm cả danh mục con) bằng form GET (chạy không cần JS, URL chia sẻ được), phân trang 9/trang (`?trang=`, trang vượt quá → trang cuối), trang lọc/phân trang `noindex,follow`; `/cong-trinh/[slug]/` chi tiết: tỉnh (link lọc), năm, danh mục, mô tả, ảnh bìa, nội dung, gallery + lightbox, CTA, Breadcrumb JSON-LD, `generateStaticParams`. Zod `schemas/project-filter.ts` (giá trị sai → bỏ qua). Seed thêm 4 ảnh gallery/công trình. `src/middleware.ts`: URL có chữ hoa → 308 về chữ thường.
- 📁 File thay đổi: `src/app/(site)/cong-trinh/{page.tsx,[slug]/page.tsx}`, `src/components/site/project-list-controls.tsx`, `src/server/queries/projects.ts`, `src/schemas/project-filter.ts`, `src/middleware.ts`, `src/components/site/site-header.tsx`, `prisma/seed.ts`, `playwright.config.ts`, `next.config.ts`, `tests/unit/project-filter.test.ts`, `tests/e2e/{projects,slug-route}.spec.ts`.
- 🐞 Lỗi / vấn đề: (1) Playwright từng **dùng lại server production cũ** người dùng bật ở cổng 3000 → 404 sai. (2) Dev server lỗi "Unexpected end of JSON input"/timeout khi test song song. → **E2E giờ chạy trên bản build production** riêng: `.next-e2e`, cổng 3100, không reuse server. (3) Windows không phân biệt hoa thường nên `/Mo-Da-Doi/` ra 200 (Vercel sẽ 404) → thêm middleware chuyển về chữ thường. (4) Logo header mất dấu ngã "Ẫ" do `truncate` + `leading-tight` cắt dấu chồng → `leading-normal py-1`.
- 🧠 Quyết định quan trọng: bộ lọc "loại" theo **nhóm danh mục cấp 1**. `pnpm test:e2e` giờ tự build (~40 giây) — chậm hơn nhưng ổn định. Test: 59 unit + 47 e2e pass, chạy 2 lần liên tiếp đều xanh.
- ⏭️ Bước tiếp theo: T13.

### 2026-11-26 — Chore: tự lưu font trong repo
- ✅ Đã xong: theo quyết định của chủ dự án, thay `next/font/google` bằng `next/font/local` (`src/app/fonts.ts`) với file woff2 từ Fontsource (`src/fonts/`, kèm giấy phép OFL): Be Vietnam Pro 400/500/600 + Lora variable, mỗi họ tách face `latin` và `vietnamese` theo `unicode-range`. Cập nhật DESIGN.md §3. Đã kiểm tra trên trình duyệt: cả 4 face đều tải, chữ có dấu đúng font; 37 e2e pass; build OK.
- 🐞 Lỗi / vấn đề: CI lỗi 2 lần vì Google Fonts trả CSS hỏng. Khi tự lưu, font fallback tự sinh của face latin (Arial) "bắt" mất ký tự tiếng Việt → tắt `adjustFontFallback` cho face latin.
- 🧠 Quyết định quan trọng: build không còn phụ thuộc mạng tới Google Fonts.

### 2026-11-26 — T11 Trang danh mục (code xong, chờ đo Lighthouse)
- ✅ Đã xong: `components/site/category-view.tsx` — Breadcrumb, H1, mô tả, **PriceRange** (nền jade-50, "không gồm phần móng", nút Zalo + Gọi), nội dung Tiptap, **SpecTable** (caption, `th scope=row`, xen kẽ stone-50), **Gallery** 2/3/4 cột + lightbox `yet-another-react-lightbox` (chú thích, nhãn tiếng Việt, Esc), **FAQ** accordion một mục, **AuthorBox** (SiteSetting `author`, ngày cập nhật), danh mục liên quan (cùng nhóm, trừ chính nó), CTA báo giá `#bao-gia`; JSON-LD BreadcrumbList + FAQPage. Zod `schemas/category.ts` lọc specs/FAQ hỏng. Seed: 8 ảnh placeholder tự tạo `public/samples/mau-*.jpg` (ghi "[MẪU]" trên ảnh) làm ảnh bìa + gallery. Test: e2e `category-page` (4) + `seo-basics` (3 trang × 2 thiết bị, mô phỏng các audit SEO của Lighthouse) → 37 e2e + 54 unit pass; build OK.
- 📁 File thay đổi: `src/components/site/{category-view,category-blocks,breadcrumb,gallery}.tsx`, `src/schemas/{category,site-settings}.ts`, `src/server/queries/{slug,related}.ts`, `src/server/cache-key.ts` + mọi query, `src/app/(site)/[slug]/page.tsx`, `next.config.ts`, `prisma/{seed,seed-data}.ts`, `public/samples/`, `tests/e2e/{category-page,seo-basics,slug-route}.spec.ts`.
- 🐞 Lỗi / vấn đề: (1) `unstable_cache` trả dữ liệu theo **cấu trúc cũ** sau khi đổi query → thêm `cacheKey()` gắn `CACHE_BUILD_ID` (SHA commit / thời điểm build) vào mọi khóa cache. (2) `unstable_cache` **biến Date thành chuỗi** → `resolveSlug` trả `updatedAt` dạng ISO string. (3) Dev server đôi khi log "Unexpected end of JSON input" khi Playwright chạy song song (đọc/ghi cache dev cùng lúc) — không ảnh hưởng kết quả, chưa thấy ở production. (4) **Chưa chạy được Lighthouse**: `npx lighthouse` bị chặn quyền.
- 🧠 Quyết định quan trọng: QuoteForm thật thuộc T15 → tạm đặt dải CTA (Báo giá/Gọi/Zalo) tại `#bao-gia`. Breadcrumb dùng stone-700 (AA). Hero trang chủ vẫn chưa dùng ảnh.
- ⏭️ Bước tiếp theo: đo Lighthouse cho T11, rồi T12.

### 2026-11-25 — T10 Route `/[slug]`
- ✅ Đã xong: `app/(site)/[slug]/page.tsx` resolve Category (đã xuất bản) rồi Page; 404 nếu không có hoặc slug sai định dạng (không truy vấn DB); `generateStaticParams` prerender 21 danh mục, `dynamicParams = true` cho slug mới; `generateMetadata` (seoTitle/seoDescription → canonical, OG); JSON-LD BreadcrumbList (Trang chủ → nhóm cha → danh mục). `server/queries/slug.ts` (`resolveSlug` cache tag `categories` + `pages`, `getAllSlugs`); `isValidSlug` trong `lib/slugify.ts`. Bộ render Tiptap JSON an toàn `components/rich-text.tsx` (chỉ React element, không HTML thô; không bao giờ ra `h1`; chặn link `javascript:`). Trang 404 tiếng Việt (trong layout site + bản gốc). Test: 15 unit mới (54 tổng) + 6 e2e mới (23 tổng) pass; build OK.
- 📁 File thay đổi: `src/app/(site)/[slug]/page.tsx`, `src/app/(site)/not-found.tsx`, `src/app/not-found.tsx`, `src/server/queries/slug.ts`, `src/components/rich-text.tsx`, `src/lib/slugify.ts`, `vitest.config.ts`, `tests/unit/rich-text.test.tsx`, `tests/e2e/slug-route.spec.ts`.
- 🐞 Lỗi / vấn đề: Vitest báo "React is not defined" với JSX → thêm `esbuild.jsx = "automatic"`.
- 🧠 Quyết định quan trọng: phần hiển thị danh mục ở T10 là bản cơ bản; T11 thay bằng template đầy đủ. Nếu lỡ trùng slug, Category thắng Page (kiểm tra trùng khi lưu ở T23).
- ⏭️ Bước tiếp theo: T11.

### 2026-11-25 — T09 Trang chủ
- ✅ Đã xong: trang chủ `app/(site)/page.tsx`: Hero (H1 + Nhận báo giá / Gọi ngay, lớp phủ 40%; chưa có ảnh → nền gradient đá), lưới 6 nhóm danh mục (CategoryCard 4:3, "Giá từ …" = giá thấp nhất của nhóm + con), khối thành tích (SiteSetting `achievements`), công trình tiêu biểu (ProjectCard 3:2, badge tỉnh, năm), quy trình 7 bước (ProcessSteps ngang/dọc, giữ câu "không gồm phần móng"), 3 đánh giá, dải CTA báo giá (Báo giá · Gọi · Zalo). Metadata riêng (canonical `/`, description). Component: `hero`, `cards`, `image-frame` (ảnh hoặc placeholder cố định tỉ lệ), `section`, `process-steps`, `quote-cta`; query `server/queries/home.ts`; `lib/order-process.ts` (dùng lại ở T14). E2E `home.spec.ts`; 11/11 e2e + 39 unit pass; build OK.
- 📁 File thay đổi: `src/app/(site)/page.tsx`, `src/components/site/{hero,cards,image-frame,section,process-steps,quote-cta,contact-actions}.tsx`, `src/server/queries/{home,site}.ts`, `src/lib/order-process.ts`, `src/schemas/site-settings.ts`, `prisma/seed-data.ts`, `next.config.ts`, `tests/e2e/*.spec.ts`.
- 🐞 Lỗi / vấn đề: `unstable_cache` trả object cài đặt cũ (thiếu `achievements`) → giờ chỉ cache dòng thô, parse Zod ngoài cache. Locator e2e cũ bị trùng do trang chủ có thêm link → giới hạn vào header / nhóm "Liên hệ nhanh".
- 🧠 Quyết định quan trọng: số liệu thành tích là `[MẪU] 00+` (không bịa số) — chủ xưởng phải nhập số thật. Cho phép ảnh từ `res.cloudinary.com`. **Cần ảnh thật** (hero + ảnh bìa danh mục/công trình) trước khi ra mắt.
- ⏭️ Bước tiếp theo: T10 (giai đoạn 2).

### 2026-11-25 — T08 FloatingContact + StickyBottomBar
- ✅ Đã xong: `components/site/contact-actions.tsx`: **FloatingContact** (≥ md, góc phải dưới: Gọi đỏ rung nhẹ `animate-ring` chỉ khi `motion-safe`, Zalo, TikTok nếu có link, Lên đầu trang hiện sau 400px) và **StickyBottomBar** (< md: Gọi · Zalo · Báo giá, chừa `safe-area-inset-bottom`, có khoảng đệm để không che footer). `lib/analytics.ts` (`trackEvent`, `trackContactClick` → GA4 event `contact_click` {channel, placement, page_path}, an toàn khi chưa có gtag); `zaloHref` trong `lib/phone.ts`. Test: 4 unit + 3 e2e (link `tel:`/Zalo đúng, bắn event, nút lên đầu, hiển thị đúng theo màn hình) → 39 unit + 7 e2e pass.
- 📁 File thay đổi: `src/components/site/contact-actions.tsx`, `src/lib/analytics.ts`, `src/lib/phone.ts`, `src/components/site/{nav-links.ts,top-bar.tsx}`, `src/app/(site)/layout.tsx`, `src/app/globals.css`, `tests/unit/analytics.test.ts`, `tests/e2e/contact-actions.spec.ts`.
- 🐞 Lỗi / vấn đề: GitHub Pull Requests vẫn **major outage** → T05–T08 đang nằm trên các nhánh nối tiếp, chưa PR.
- 🧠 Quyết định quan trọng: nút "Báo giá" tạm trỏ `/lien-he/#bao-gia` (`QUOTE_HREF`), T17 đổi thành mở popup. TikTok dùng icon chung (lucide không có logo thương hiệu). Zalo dùng số `zalo` trong cài đặt, nếu trống thì dùng hotline. Script GA4 sẽ nạp ở T29 (`NEXT_PUBLIC_GA_ID`); các nút Gọi ở Header/TopBar/Banner chưa bắn event (là Server Component) — bổ sung khi nạp GA.
- ⏭️ Bước tiếp theo: T09.

### 2026-11-25 — T07 MegaMenu
- ✅ Đã xong: `components/site/mega-menu.tsx` (desktop ≥ lg: Radix NavigationMenu, nút "Sản phẩm" mở panel rộng bằng header, 6 cột theo nhóm + gạch vàng, cùng các link tĩnh); `components/site/mobile-menu.tsx` (< lg: Sheet trượt từ trái, Accordion một mục mở một lúc, "Tất cả …" cho từng nhóm, đóng khi chọn link); `server/queries/categories.ts` (`getMenuCategories`, tag `categories`). Thêm shadcn `navigation-menu`, `sheet`, `accordion`; dịch "Close" → "Đóng". **Playwright** + `tests/e2e/navigation.spec.ts`: mở bằng Enter, Tab vào panel, đóng bằng Esc; drawer accordion + Esc + đóng khi bấm link → 4/4 pass.
- 📁 File thay đổi: `src/components/site/{mega-menu,mobile-menu,site-header}.tsx`, `src/server/queries/categories.ts`, `src/app/(site)/layout.tsx`, `src/components/ui/{navigation-menu,sheet,accordion}.tsx`, `playwright.config.ts`, `tests/e2e/navigation.spec.ts`, `package.json`, `.gitignore`.
- 🐞 Lỗi / vấn đề: Radix bọc danh sách bằng `div` có `position: relative` inline → panel bị neo hẹp; sửa bằng `[&>div]:static!`. Radix Slot không gộp class của Link con → đặt class trên `NavigationMenuLink`.
- 🧠 Quyết định quan trọng: Playwright local dùng Edge có sẵn (`channel: msedge`), CI sẽ cài Chromium khi đưa e2e vào CI (T28). Chưa có ảnh đại diện nhóm trong panel (DESIGN §5) vì chưa có ảnh — bổ sung khi có Image.
- ⏭️ Bước tiếp theo: T08.

### 2026-11-25 — T06 Layout site
- ✅ Đã xong: `app/(site)/layout.tsx` (TopBar, PromoBanner, Header dính, Footer, link "Bỏ qua menu", JSON-LD LocalBusiness, title template theo `brandName`, `revalidate = 3600`); `server/queries/site.ts` (`getSiteSettings`, `getActiveBanner` qua `unstable_cache` + tag `site-settings`/`banners`); `schemas/site-settings.ts` (Zod, parse từng key, giá trị lỗi → mặc định); `lib/phone.ts` (`formatPhone`, `telHref` dạng +84). Đã xem ảnh chụp desktop + mobile. 35 test pass, `pnpm build` OK.
- 📁 File thay đổi: `src/app/(site)/layout.tsx`, `src/components/site/{top-bar,promo-banner,site-header,site-footer,nav-links}.tsx|ts`, `src/server/queries/site.ts`, `src/schemas/site-settings.ts`, `src/lib/phone.ts`, `tests/unit/site-settings.test.ts`, `.github/workflows/ci.yml`, `.prettierrc.json`, `package.json` (zod).
- 🐞 Lỗi / vấn đề: GitHub Pull Requests bị **major outage** (25/11 ~16:10) → không tạo được PR cho T05; T06 làm trên nhánh nối tiếp `task/T06-site-layout` (tách từ `task/T05-lib-utils`), sẽ mở PR khi GitHub ổn. Plugin Prettier-Tailwind chưa biết token màu → thêm `tailwindStylesheet`.
- 🧠 Quyết định quan trọng: **CI có Postgres service** + `prisma migrate deploy` + `db:seed` trước `build`, vì trang công khai đọc DB khi prerender. Menu tạm là link tĩnh (Giới thiệu, Công trình, Đặt hàng, Tin tức, Liên hệ); MegaMenu danh mục ở T07; các route này sẽ 404 cho tới T10–T14. Footer chưa có bản đồ nhỏ (cần địa chỉ thật — làm cùng trang Liên hệ T14).
- ⏭️ Bước tiếp theo: T07.

### 2026-11-25 — T05 Tiện ích chung
- ✅ Đã xong: `lib/slugify.ts` (bỏ dấu tiếng Việt, đ→d); `lib/format-price.ts` (`formatPriceRange`: "20 – 50 triệu", "300 triệu – 1,5 tỷ", "Từ …", "Đến …", "Liên hệ"); `lib/site-url.ts` (`absoluteUrl` theo `NEXT_PUBLIC_SITE_URL`, tự thêm `/` cuối cho trailingSlash); `lib/seo.ts` (`buildMetadata`: title, description ≤ 160 ký tự, canonical, OG, Twitter, noindex); `lib/jsonld.ts` (BreadcrumbList, FAQPage, Article, LocalBusiness + `serializeJsonLd` chống chèn `</script>`); component `components/json-ld.tsx`. 23 unit test mới trong `tests/unit/lib.test.ts` (tổng 30 pass), gồm `slugify("Mộ Đá Đôi") === "mo-da-doi"`.
- 📁 File thay đổi: `src/lib/{slugify,format-price,site-url,seo,jsonld}.ts`, `src/components/json-ld.tsx`, `tests/unit/lib.test.ts`.
- 🐞 Lỗi / vấn đề: ký tự U+2028/2029 trong regex bị ghi thành ký tự thô → bỏ, vì JSON-LD chỉ cần escape `<`, `>`, `&`.
- 🧠 Quyết định quan trọng: `JsonLd` dùng `dangerouslySetInnerHTML` nhưng chỉ với chuỗi đã qua `serializeJsonLd` (đúng RULES §2). `DEFAULT_SITE_NAME` tạm là `[MẪU]`, sẽ lấy từ SiteSetting `brandName` ở T06.
- ⏭️ Bước tiếp theo: T06 (giai đoạn 1).

### 2026-11-25 — T04 Seed dữ liệu mẫu
- ✅ Đã xong: `prisma/seed.ts` + `prisma/seed-data.ts`: 6 nhóm + 15 danh mục con (specs, FAQ, khoảng giá mẫu, nội dung Tiptap), 6 công trình (3 nổi bật), 3 đánh giá, 3 bài viết, 1 banner, 8 cài đặt site, 1 admin (bcrypt cost 12). Mọi nội dung gắn `[MẪU]`; SĐT `0900000000`, email `@example.com`; `SiteSetting.isSampleData = true`. Upsert theo khóa cố định, không xóa gì → chạy `pnpm db:seed` 3 lần liên tiếp, số bản ghi không đổi. Unit test `tests/unit/seed-data.test.ts` (slug duy nhất, đúng định dạng, có `[MẪU]`).
- 📁 File thay đổi: `prisma/seed.ts`, `prisma/seed-data.ts`, `tests/unit/seed-data.test.ts`, `package.json` (`db:seed`, `prisma.seed`, `bcryptjs`), `.env.example`.
- 🐞 Lỗi / vấn đề: chưa có ảnh mẫu (Image cần Cloudinary) → danh mục/công trình chưa có ảnh bìa, gallery trống; sẽ cần ảnh placeholder khi làm T09/T11.
- 🧠 Quyết định quan trọng: admin lấy từ `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` trong `.env` (≥ 12 ký tự), **không** ghi đè mật khẩu admin đã tồn tại. Dùng `bcryptjs` (JS thuần, không cần build native trên Windows/Vercel). Tên tỉnh theo đơn vị hành chính sau sáp nhập 7/2025 (34 tỉnh/thành) — cần áp dụng cho select tỉnh ở T15. Không tạo Page tĩnh (thuộc T14).
- ⏭️ Bước tiếp theo: T05.

### 2026-11-25 — T03 Database & Prisma
- ✅ Đã xong: Prisma 6 + `prisma/schema.prisma` đủ 12 model theo ARCHITECTURE §3 (User, Image, Category 2 cấp, CategoryImage, Project, ProjectImage, Post, Testimonial, Banner, Page, Lead, SiteSetting) + enum Role, LeadStatus, index cho các truy vấn lọc; migration `init`; `src/server/db.ts` (singleton, `server-only`); Postgres 17 local qua `docker-compose.yml`; script `db:up`, `db:generate`, `db:migrate`, `db:studio`, `postinstall: prisma generate`. Đã kiểm tra: migrate chạy, `dt` thấy đủ 12 bảng, Prisma Studio trả 200.
- 📁 File thay đổi: `prisma/schema.prisma`, `prisma/migrations/*_init`, `src/server/db.ts`, `docker-compose.yml`, `.env.example`, `.gitattributes`, `package.json`, `pnpm-lock.yaml`, `AGENTS.md`.
- 🐞 Lỗi / vấn đề: Docker Desktop chưa chạy → đã mở `D:DockerDocker Desktop.exe`. Git (autocrlf) và Prettier đánh nhau CRLF/LF → thêm `.gitattributes` `eol=lf`.
- 🧠 Quyết định quan trọng: dev dùng Postgres trong Docker (`stone/stone@localhost:5432/stone_mvp`, chỉ local); DB production chọn ở T29. Ghim Prisma 6 (Prisma 7/8 đổi cách cấu hình). Xóa ảnh/danh mục → quan hệ `SetNull`; xóa User có bài viết bị chặn (`Restrict`). `SiteSetting.key` là khóa chính. Giá lưu kiểu `Int` (VND).
- 🧑‍💻 Cần làm ở máy mới: `cp .env.example .env` → sửa DATABASE_URL → `pnpm db:up && pnpm db:migrate`.
- ⏭️ Bước tiếp theo: T04.

### 2026-11-25 — T02 Design tokens & font
- ✅ Đã xong: token màu DESIGN.md trong `@theme` của Tailwind v4 (`bg-jade-700`, `bg-gold-600`, `text-stone-900`...; đã xóa thang `stone`/`red` mặc định của Tailwind để chỉ còn đúng các sắc trong DESIGN); font Lora (600/700) + Be Vietnam Pro (400/500/600) qua `next/font/google` subset vietnamese; thang chữ `text-h1/h2/h3/body/small` (+ biến thể `-lg` cho desktop), style mặc định cho h1–h3 và body 17/18px; tiện ích `section-ornament` (gạch vàng 48×2px) và `text-small-responsive`; shadcn/ui (radix, new-york) + Button với biến thể `cta`, `call`, `zalo`, kích thước ≥ 44px; trang `/dev/styleguide` (noindex, 404 ở production). Đã xem ảnh chụp desktop/mobile.
- 📁 File thay đổi: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/(site)/page.tsx`, `src/app/dev/styleguide/page.tsx`, `src/components/ui/button.tsx`, `src/lib/utils.ts`, `components.json`, `package.json`, `pnpm-lock.yaml`.
- 🐞 Lỗi / vấn đề: lần đầu `shadcn init` lỗi DNS tạm thời tới ui.shadcn.com, chạy lại thì được. shadcn bản mới dùng gói `cn` (của chính shadcn-ui) thay cho clsx + tailwind-merge — giữ nguyên.
- 🧠 Quyết định quan trọng: **Tương phản AA** — chữ trắng trên `gold-600` chỉ 3.21:1 nên nút CTA dùng chữ `stone-900` trên `gold-600` (4.92:1), hover `gold-700` + chữ trắng (4.74:1) — đúng phương án dự phòng DESIGN §2. `stone-500` trên nền trắng chỉ 3.87:1 → không dùng cho chữ; `muted-foreground` = `stone-700` (9.62:1). **Lưu ý cho T11:** Breadcrumb trong DESIGN ghi `stone-500` → sẽ dùng `stone-700` để đạt AA. Admin dùng primary = `jade-700`. Không làm dark mode (DESIGN không yêu cầu). `PROGRESS.md` đã được chuyển vào `docs/`, cập nhật đường dẫn trong AGENTS.md.
- ⏭️ Bước tiếp theo: T04.

### 2026-11-25 — T01 Khởi tạo dự án
- ✅ Đã xong: Next.js 15.5 (App Router) + React 19 + TypeScript strict + Tailwind v4 (PostCSS) + ESLint 9 flat config (`next/core-web-vitals`, `next/typescript`, prettier) + Prettier (plugin tailwind) + Vitest; pnpm 9; cấu trúc thư mục theo ARCHITECTURE.md (thư mục trống giữ bằng `.gitkeep`); `.env.example`, `.gitignore`; trang chủ tạm `[MẪU]`. Đã kiểm tra: `pnpm lint && pnpm typecheck && pnpm test` sạch, `pnpm dev` trả 200 ở `/`.
- 📁 File thay đổi: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `vitest.config.ts`, `.env.example`, `.gitignore`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/(site)/page.tsx`, `tests/unit/smoke.test.ts`.
- 🐞 Lỗi / vấn đề: máy chưa có pnpm, `corepack enable` lỗi EPERM → đã cài `npm i -g pnpm@9`. `next lint` bị deprecated → script `lint` dùng `eslint .`.
- 🧠 Quyết định quan trọng: dựng tay thay vì `create-next-app` (thư mục đã có file tài liệu). Bật `trailingSlash: true` ngay (ARCHITECTURE §5). Thêm `noUncheckedIndexedAccess`. `pnpm test` dùng `--passWithNoTests` + 1 smoke test.
- ⏭️ Bước tiếp theo: T02.

### 2026-11-25 — Khởi tạo tài liệu
- ✅ Đã xong: phân tích lamtao.vn; tạo AGENTS.md, PRD.md, ARCHITECTURE.md, DESIGN.md, RULES.md, TASKS.md, PROGRESS.md.
- 🐞 Lỗi / vấn đề: chưa có.
- ⏭️ Bước tiếp theo: T01.

<!--
Mẫu cho mỗi lần cập nhật:

### YYYY-MM-DD — Txx <tên task>
- ✅ Đã xong: ...
- 📁 File thay đổi: ...
- 🐞 Lỗi / vấn đề: ... (đã sửa? cách sửa? còn tồn tại?)
- 🧠 Quyết định quan trọng: ... (vì sao)
- ⏭️ Bước tiếp theo: ...
-->

## Lỗi đã biết (chưa sửa)
_Chưa có._

## Quyết định kỹ thuật
| Ngày | Quyết định | Lý do |
|---|---|---|
| 2026-11-25 | Next.js + Prisma + Postgres thay cho WordPress | SEO tốt, admin tùy biến cho quản lý lead |
| 2026-11-25 | Trang danh mục là "trang sản phẩm", không làm trang chi tiết từng mẫu | Giống mô hình site tham chiếu, phù hợp SEO và cách khách hỏi giá |
| 2026-11-25 | Thêm form báo giá + quản lý lead | Site tham chiếu chỉ có gọi/Zalo, mất lead ngoài giờ |
| 2026-11-26 | Tự lưu font (next/font/local) thay Google Fonts | CI lỗi khi Google Fonts trả dữ liệu hỏng; chủ dự án đồng ý |
