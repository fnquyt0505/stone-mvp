# RULES — Quy tắc viết code

## 1. Chung
- TypeScript `strict: true`. Không dùng `any`; dùng `unknown` rồi thu hẹp kiểu.
- Mặc định là **Server Component**. Chỉ thêm `"use client"` khi cần state, effect hoặc event handler — và đặt ở component lá nhỏ nhất.
- Đọc dữ liệu trong `src/server/queries`, ghi dữ liệu bằng Server Actions trong `src/server/actions`. Component không gọi Prisma trực tiếp.
- Mọi input từ người dùng (form site, form admin, query string) đi qua **Zod schema** trong `src/schemas`, validate ở **server** (validate ở client chỉ để UX).
- Tên file: `kebab-case.tsx`; component: `PascalCase`; hàm/biến: `camelCase`; hằng số: `UPPER_SNAKE_CASE`.
- Chữ hiển thị cho người dùng viết **tiếng Việt có dấu**; tên biến, comment code bằng tiếng Anh.
- Style bằng Tailwind và token trong DESIGN.md. Không hard-code màu hex trong component.
- Một component ≤ ~200 dòng; dài hơn thì tách.
- Định dạng bằng Prettier, lint bằng ESLint (`next/core-web-vitals`). Code phải qua `pnpm lint && pnpm typecheck` trước khi báo xong.

## 2. Dữ liệu & bảo mật
- Mọi Server Action của admin **bắt đầu bằng** kiểm tra session và role (`requireAdmin()`).
- `/admin/*` được bảo vệ bởi middleware **và** kiểm tra lại ở server (không tin middleware một mình).
- Mật khẩu băm bằng bcrypt (cost ≥ 10). Không log mật khẩu, token, SĐT đầy đủ.
- Form báo giá: Turnstile + honeypot + rate limit (ví dụ 5 lần/10 phút/IP).
- Lưu lead vào DB **trước**, gửi thông báo **sau**; lỗi thông báo không được làm form báo lỗi với khách.
- Render rich text bằng renderer đã sanitize; không dùng `dangerouslySetInnerHTML` với dữ liệu chưa làm sạch.
- Thay đổi schema DB chỉ qua `prisma migrate dev` có tên rõ nghĩa.

## 3. SEO & hiệu năng
- Mỗi trang công khai có `generateMetadata` (title, description, canonical, OG).
- Mỗi trang có đúng **một** `<h1>`; heading không nhảy cấp.
- Ảnh luôn dùng `next/image` với `width/height` hoặc `fill` + `sizes`, và `alt` có nghĩa.
- Slug: tiếng Việt không dấu, chữ thường, gạch nối (`mo-da-doi`). Dùng `lib/slugify.ts`.
- Không thêm thư viện client nặng (> 30 kB gzip) khi chưa hỏi.

## 4. Quy trình làm việc của AI
- Làm **một task trong TASKS.md mỗi lần**. Đọc PRD, ARCHITECTURE, DESIGN, RULES trước khi bắt đầu.
- Trước khi sửa file, đọc file đó. Chỉ sửa trong phạm vi task.
- Xong task: chạy lint, typecheck, test liên quan; cập nhật **PROGRESS.md** (đã xong, lỗi, bước tiếp theo) và đánh dấu `[x]` trong TASKS.md.
- Không chắc yêu cầu → hỏi, không đoán. Phát hiện yêu cầu mâu thuẫn giữa các file → dừng và báo.

## 5. AI TUYỆT ĐỐI KHÔNG ĐƯỢC
1. ❌ Commit hoặc in ra secret, `.env`, API key, mật khẩu.
2. ❌ Chạy `prisma migrate reset`, `db push --force-reset`, `DROP`, `TRUNCATE` hoặc xóa dữ liệu thật khi chưa được xác nhận.
3. ❌ Xóa / đổi tên file, thư mục ngoài phạm vi task; xóa test để test "pass".
4. ❌ Tắt TypeScript/ESLint (`// @ts-ignore`, `eslint-disable`) để lách lỗi — trừ khi có comment giải thích và được đồng ý.
5. ❌ Tự ý thêm, nâng cấp hoặc thay thư viện lớn (framework, ORM, auth, UI kit) khác ARCHITECTURE.md.
6. ❌ Bịa nội dung kinh doanh như thật: giá cụ thể, số điện thoại, địa chỉ, giải thưởng, đánh giá khách hàng. Dữ liệu mẫu phải ghi rõ là mẫu (`[MẪU]`) và lấy từ `seed.ts`.
7. ❌ Sao chép văn bản hoặc ảnh từ lamtao.vn hay site đối thủ. Chỉ tham khảo cấu trúc.
8. ❌ Để lộ route admin/API không kiểm tra quyền.
9. ❌ Gọi API bên ngoài từ client với secret key.
10. ❌ `git push --force`, viết lại lịch sử nhánh `main`.
11. ❌ Đánh dấu task hoàn thành khi lint/typecheck/test còn lỗi.
