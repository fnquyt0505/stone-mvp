# Website xưởng đá mỹ nghệ (MVP)

Website giới thiệu và **thu yêu cầu báo giá** cho xưởng chế tác đá mỹ nghệ: lăng mộ đá, nhà thờ họ, tượng đá, đồ thờ, kiến trúc đá. Khách không mua online — mọi trang dẫn tới 3 hành động: **gọi, nhắn Zalo, gửi form báo giá**.

- Hướng dẫn cho nhân viên dùng trang quản trị: [`docs/HUONG-DAN-ADMIN.md`](docs/HUONG-DAN-ADMIN.md)
- Hướng dẫn deploy lên Vercel + Neon: [`docs/DEPLOY.md`](docs/DEPLOY.md)
- Tài liệu sản phẩm / kỹ thuật: [`docs/`](docs/) (PRD, ARCHITECTURE, DESIGN, RULES, TASKS, PROGRESS)
- Quy ước cho AI agent: [`AGENTS.md`](AGENTS.md)

## Công nghệ

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 + shadcn/ui · PostgreSQL + Prisma 6 · Auth.js v5 (đăng nhập admin) · Tiptap (soạn nội dung) · Cloudinary (ảnh) · Resend + Telegram (báo lead) · Cloudflare Turnstile (chống spam) · Vitest + Playwright.

## Chạy trên máy

Yêu cầu: Node.js 22+, pnpm 9, Docker Desktop.

```bash
pnpm install
cp .env.example .env          # rồi điền DATABASE_URL, AUTH_SECRET, SEED_ADMIN_* ...
pnpm db:up                    # bật Postgres trong Docker
pnpm db:migrate               # tạo bảng
pnpm db:seed                  # nạp dữ liệu mẫu [MẪU] + tài khoản admin
pnpm dev                      # http://localhost:3000 — admin: /admin/login/
```

- `AUTH_SECRET`: chuỗi ngẫu nhiên dài (ví dụ `openssl rand -base64 32`).
- Tài khoản admin lấy từ `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (mật khẩu ≥ 12 ký tự). Seed **không** ghi đè mật khẩu của admin đã có.
- Chưa có Cloudinary: ảnh upload được lưu tạm trong `public/uploads/` (chỉ khi phát triển, không bao giờ trên Vercel).
- Turnstile khi phát triển có thể dùng key test của Cloudflare (xem `.env.example`).

## Lệnh thường dùng

| Lệnh | Việc |
|---|---|
| `pnpm dev` | Chạy dev server |
| `pnpm build` / `pnpm start` | Build và chạy bản production |
| `pnpm lint` · `pnpm typecheck` · `pnpm test` | ESLint · TypeScript · unit test (Vitest) |
| `pnpm test:e2e` | Test trình duyệt (Playwright) — tự build vào `.next-e2e`, chạy ở cổng 3100 |
| `pnpm db:migrate` · `pnpm db:seed` · `pnpm db:studio` | Migration · dữ liệu mẫu · xem DB |

E2E chia 2 nhóm: test **chỉ đọc** chạy trước, test **ghi dữ liệu** (admin, gửi form) chạy sau để không làm sai số liệu của nhau. Dữ liệu do test tạo được tự dọn.

## Quy trình làm việc

Mỗi việc một nhánh `task/...` → PR vào `main`. GitHub Actions (`.github/workflows/ci.yml`) chạy lint, typecheck, unit test, build và **toàn bộ e2e** trên Postgres tạm; **pass thì tự squash-merge**. Không commit thẳng lên `main`.

## Cấu trúc chính

```
src/app/(site)/       Trang công khai: trang chủ, /[slug] (danh mục + trang tĩnh), công trình, tin tức, liên hệ…
src/app/admin/        Trang quản trị (bảo vệ bằng middleware + requireStaff/requireAdmin ở server)
src/app/api/          Auth.js, ký upload Cloudinary, ảnh cục bộ khi phát triển
src/components/       site/ (giao diện công khai), admin/ (form quản trị), ui/ (shadcn)
src/server/           db, queries/ (đọc, có cache theo tag), actions/ (ghi, luôn kiểm tra quyền)
src/schemas/          Zod — mọi dữ liệu người dùng nhập được kiểm tra ở server
src/lib/              Tiện ích: slug, giá, SĐT, SEO/JSON-LD, lọc nội dung rich text…
prisma/               schema, migrations, seed (dữ liệu mẫu [MẪU])
tests/                unit/ (Vitest), e2e/ (Playwright)
```

## Biến môi trường

Xem đầy đủ trong [`.env.example`](.env.example).

| Biến | Bắt buộc ở production | Ghi chú |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL — Neon: chuỗi **pooled** (`-pooler`) |
| `DIRECT_URL` | ✅ | Chuỗi kết nối trực tiếp cho migration (local: giống `DATABASE_URL`) |
| `AUTH_SECRET` | ✅ | Chuỗi bí mật riêng cho production |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Ví dụ `https://ten-mien.vn` (dùng cho canonical, sitemap) |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | ✅ | Upload ảnh |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | ✅ | Key thật từ Cloudflare |
| `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL`, `LEAD_NOTIFY_FROM` | Nên có | Email báo lead mới |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Tùy chọn | Báo lead qua Telegram |
| `NEXT_PUBLIC_GA_ID` | Tùy chọn | Google Analytics 4 |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Lần seed đầu | Tạo tài khoản admin đầu tiên |

## Trước khi ra mắt (checklist)

1. Deploy theo [`docs/DEPLOY.md`](docs/DEPLOY.md) (Neon + Vercel; migration tự chạy mỗi lần deploy qua script `vercel-build`).
2. Đăng nhập admin → **Cài đặt**: tên thương hiệu, hotline, Zalo, email, địa chỉ, giờ làm, bản đồ, mạng xã hội, thành tích thật, người biên soạn.
3. Thay toàn bộ nội dung `[MẪU]`: danh mục, công trình (ảnh thật), bài viết, trang tĩnh, đánh giá thật, banner.
4. **Nhờ người có chuyên môn rà soát** các trang chính sách (bảo mật, điều khoản, cookie, miễn trừ).
5. Trong **Cài đặt**, **bỏ chọn "Website đang dùng dữ liệu mẫu"** — khi còn chọn, `robots.txt` chặn Google lập chỉ mục toàn site.
6. Gửi thử một yêu cầu báo giá → kiểm tra email/Telegram và mục **Yêu cầu báo giá** trong admin.
7. Khai báo `https://ten-mien/sitemap.xml` trong Google Search Console; đo Lighthouse các trang chính.
