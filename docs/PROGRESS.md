# PROGRESS

> Cập nhật sau **mỗi** task. Mục mới nhất ở trên cùng. Giữ ngắn gọn, đủ để người/AI khác tiếp tục ngay.

## Trạng thái hiện tại
- **Giai đoạn:** 2 — Nội dung cốt lõi
- **Task đang làm:** T11 — chờ đo Lighthouse
- **Task tiếp theo:** T12 Công trình (sau khi chốt cách đo Lighthouse cho T11)
- **Chặn bởi:** Cần chủ dự án chốt tên thương hiệu, logo, hotline, Zalo, địa chỉ (có thể dùng `[MẪU]` để làm trước).

## Tổng quan
| Giai đoạn | Task | Xong |
|---|---|---|
| 0 Nền móng | T01–T05 | 5/5 |
| 1 Khung site | T06–T09 | 4/4 |
| 2 Nội dung | T10–T14 | 1/5 |
| 3 Thu lead | T15–T17 | 0/3 |
| 4 Admin | T18–T25 | 0/8 |
| 5 Ra mắt | T26–T30 | 0/5 |

## Nhật ký

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
