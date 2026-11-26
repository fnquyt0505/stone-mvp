# Deploy lên Vercel + Neon

Thời gian: khoảng 30–45 phút. Cần: tài khoản GitHub (đã có repo `stone-mvp`), email để đăng ký Neon và Vercel.

Thứ tự quan trọng: **tạo database → nạp dữ liệu → rồi mới deploy**, để lần build đầu tiên đã có nội dung.

## Bước 1 — Tạo database trên Neon

1. Vào <https://neon.tech> → **Sign up** (đăng nhập bằng GitHub cho nhanh).
2. **Create project**:
   - Project name: `stone-mvp`
   - Postgres version: mặc định (17)
   - **Region: AWS Asia Pacific (Singapore)** — gần Việt Nam và trùng vùng server Vercel (`vercel.json` đặt `sin1`).
3. Ở trang project, bấm **Connect** (hoặc *Connection details*). Lấy **2 chuỗi kết nối**:
   - **Pooled** (bật *Connection pooling*): host có chữ `-pooler`, ví dụ
     `postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
     → dùng làm **`DATABASE_URL`**. Thêm `&connect_timeout=15` vào cuối (Neon có thể "ngủ" khi ít truy cập, cần vài giây để thức dậy).
   - **Direct** (tắt *Connection pooling*): host **không** có `-pooler`
     → dùng làm **`DIRECT_URL`** (Prisma cần để chạy migration).

> Giữ kín hai chuỗi này — chúng chứa mật khẩu database. Không gửi qua chat, không commit lên GitHub.

## Bước 2 — Tạo bảng và nạp dữ liệu (chạy trên máy bạn)

Mở PowerShell trong thư mục dự án, thay các giá trị trong ngoặc:

```powershell
$env:DATABASE_URL = "<chuỗi POOLED>"
$env:DIRECT_URL   = "<chuỗi DIRECT>"
$env:SEED_ADMIN_EMAIL    = "<email admin thật>"
$env:SEED_ADMIN_PASSWORD = "<mật khẩu mạnh, ít nhất 12 ký tự>"

pnpm prisma migrate deploy   # tạo các bảng
pnpm db:seed                 # nạp dữ liệu mẫu [MẪU] + tạo tài khoản admin
```

- Biến `$env:` chỉ có tác dụng trong cửa sổ PowerShell đó và **ghi đè** giá trị trong `.env`, nên không ảnh hưởng database trên máy.
- Seed tạo nội dung `[MẪU]` để có website hoàn chỉnh xem thử; thay dần bằng nội dung thật trong admin.
- Dùng **email/mật khẩu admin khác** với bản trên máy.

## Bước 3 — Chuẩn bị biến môi trường

Tạo `AUTH_SECRET` (chuỗi bí mật mới, chỉ dùng cho production):

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

| Biến | Giá trị | Bắt buộc |
|---|---|---|
| `DATABASE_URL` | Chuỗi **pooled** của Neon (+ `&connect_timeout=15`) | ✅ |
| `DIRECT_URL` | Chuỗi **direct** của Neon | ✅ |
| `AUTH_SECRET` | Chuỗi vừa tạo ở trên | ✅ |
| `NEXT_PUBLIC_SITE_URL` | `https://<tên-project>.vercel.app` (đổi thành tên miền sau) | ✅ |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare → Turnstile → Add site (miễn phí) | Nên có ngay* |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | cloudinary.com → Dashboard (miễn phí) | Cần để **tải ảnh** trong admin |
| `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL`, `LEAD_NOTIFY_FROM` | resend.com (email báo lead) | Nên có |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Bot Telegram báo lead | Tùy chọn |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 | Tùy chọn |

\* Thiếu Turnstile, form báo giá **vẫn nhận lead** (còn honeypot + giới hạn số lần gửi) nhưng chống spam yếu hơn.
Khi tạo site Turnstile, thêm tên miền `<tên-project>.vercel.app` (và tên miền thật sau này).

## Bước 4 — Deploy trên Vercel

1. Vào <https://vercel.com> → **Sign up** bằng GitHub.
2. **Add New… → Project** → chọn repo **`stone-mvp`** → **Import**.
   (Nếu không thấy repo: *Adjust GitHub App Permissions* → cho phép repo `stone-mvp`.)
3. Màn hình cấu hình:
   - Framework Preset: **Next.js** (tự nhận).
   - Root Directory: để nguyên `./`.
   - Build / Install Command: **để mặc định** — Vercel tự dùng `pnpm` và script `vercel-build` (= `prisma migrate deploy && next build`, tự cập nhật cấu trúc database mỗi lần deploy).
   - **Environment Variables**: thêm toàn bộ biến ở Bước 3 (chọn cho cả *Production* và *Preview*).
4. Bấm **Deploy**, chờ khoảng 3–5 phút.
5. Xong: mở `https://<tên-project>.vercel.app` và `…/admin/login/` (đăng nhập bằng admin ở Bước 2).

Từ giờ, **mỗi khi PR được merge vào `main`, Vercel tự deploy lại**. Mỗi PR cũng có một bản *Preview* riêng.

> Nếu tên project trên Vercel khác với `NEXT_PUBLIC_SITE_URL` đã nhập: sửa biến trong *Settings → Environment Variables*, rồi *Deployments → … → Redeploy*.

## Bước 5 — Kiểm tra sau khi deploy

- [ ] Trang chủ, một trang danh mục (`/mo-da-doi/`), `/cong-trinh/`, `/lien-he/` mở được.
- [ ] Đăng nhập admin được; vào **Cài đặt** sửa thử giờ làm → website đổi ngay.
- [ ] Gửi thử form báo giá → thấy trong **Yêu cầu báo giá** (và email/Telegram nếu đã cài).
- [ ] Tải thử một ảnh trong **Thư viện ảnh** (cần Cloudinary).
- [ ] `…/robots.txt` đang **chặn toàn site** (vì còn dữ liệu mẫu) — đúng như mong muốn trước khi ra mắt.

## Bước 6 — Gắn tên miền (khi đã có)

1. Vercel → Project → **Settings → Domains** → thêm `ten-mien.vn` (và `www.ten-mien.vn`).
2. Làm theo hướng dẫn DNS Vercel hiển thị (bản ghi `A` / `CNAME`) tại nơi mua tên miền.
3. Đổi `NEXT_PUBLIC_SITE_URL` thành `https://ten-mien.vn` → **Redeploy**.
4. Thêm tên miền mới vào site Turnstile trên Cloudflare.

## Khi ra mắt chính thức

Làm theo **checklist "Trước khi ra mắt"** trong [README](../README.md), đặc biệt: thay hết nội dung `[MẪU]`, rà soát trang chính sách, rồi **bỏ chọn "Website đang dùng dữ liệu mẫu"** trong Cài đặt để Google bắt đầu lập chỉ mục.

## Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| Build lỗi `P1001: Can't reach database` | Kiểm tra `DATABASE_URL`/`DIRECT_URL`, có `sslmode=require`; thêm `connect_timeout=15` |
| Build lỗi khi migrate | `DIRECT_URL` phải là chuỗi **không** có `-pooler` |
| Đăng nhập admin báo lỗi cấu hình | Thiếu `AUTH_SECRET` trên Vercel |
| Tải ảnh báo "Chưa cấu hình nơi lưu ảnh" | Thêm 3 biến Cloudinary rồi Redeploy |
| Link chia sẻ / sitemap ra địa chỉ sai | Sửa `NEXT_PUBLIC_SITE_URL` rồi Redeploy |
