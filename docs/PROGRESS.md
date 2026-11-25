# PROGRESS

> Cập nhật sau **mỗi** task. Mục mới nhất ở trên cùng. Giữ ngắn gọn, đủ để người/AI khác tiếp tục ngay.

## Trạng thái hiện tại
- **Giai đoạn:** 0 — Nền móng
- **Task đang làm:** —
- **Task tiếp theo:** T03 Database & Prisma
- **Chặn bởi:** Cần chủ dự án chốt tên thương hiệu, logo, hotline, Zalo, địa chỉ (có thể dùng `[MẪU]` để làm trước).

## Tổng quan
| Giai đoạn | Task | Xong |
|---|---|---|
| 0 Nền móng | T01–T05 | 2/5 |
| 1 Khung site | T06–T09 | 0/4 |
| 2 Nội dung | T10–T14 | 0/5 |
| 3 Thu lead | T15–T17 | 0/3 |
| 4 Admin | T18–T25 | 0/8 |
| 5 Ra mắt | T26–T30 | 0/5 |

## Nhật ký

### 2026-11-25 — T02 Design tokens & font
- ✅ Đã xong: token màu DESIGN.md trong `@theme` của Tailwind v4 (`bg-jade-700`, `bg-gold-600`, `text-stone-900`...; đã xóa thang `stone`/`red` mặc định của Tailwind để chỉ còn đúng các sắc trong DESIGN); font Lora (600/700) + Be Vietnam Pro (400/500/600) qua `next/font/google` subset vietnamese; thang chữ `text-h1/h2/h3/body/small` (+ biến thể `-lg` cho desktop), style mặc định cho h1–h3 và body 17/18px; tiện ích `section-ornament` (gạch vàng 48×2px) và `text-small-responsive`; shadcn/ui (radix, new-york) + Button với biến thể `cta`, `call`, `zalo`, kích thước ≥ 44px; trang `/dev/styleguide` (noindex, 404 ở production). Đã xem ảnh chụp desktop/mobile.
- 📁 File thay đổi: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/(site)/page.tsx`, `src/app/dev/styleguide/page.tsx`, `src/components/ui/button.tsx`, `src/lib/utils.ts`, `components.json`, `package.json`, `pnpm-lock.yaml`.
- 🐞 Lỗi / vấn đề: lần đầu `shadcn init` lỗi DNS tạm thời tới ui.shadcn.com, chạy lại thì được. shadcn bản mới dùng gói `cn` (của chính shadcn-ui) thay cho clsx + tailwind-merge — giữ nguyên.
- 🧠 Quyết định quan trọng: **Tương phản AA** — chữ trắng trên `gold-600` chỉ 3.21:1 nên nút CTA dùng chữ `stone-900` trên `gold-600` (4.92:1), hover `gold-700` + chữ trắng (4.74:1) — đúng phương án dự phòng DESIGN §2. `stone-500` trên nền trắng chỉ 3.87:1 → không dùng cho chữ; `muted-foreground` = `stone-700` (9.62:1). **Lưu ý cho T11:** Breadcrumb trong DESIGN ghi `stone-500` → sẽ dùng `stone-700` để đạt AA. Admin dùng primary = `jade-700`. Không làm dark mode (DESIGN không yêu cầu). `PROGRESS.md` đã được chuyển vào `docs/`, cập nhật đường dẫn trong AGENTS.md.
- ⏭️ Bước tiếp theo: T03.

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
