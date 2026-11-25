# AGENTS.md — Hướng dẫn cho AI coding agent

Bạn đang xây MVP website giới thiệu và thu lead cho một **xưởng đá mỹ nghệ** (lăng mộ đá, nhà thờ họ, tượng đá, đồ thờ, kiến trúc đá), lấy cảm hứng cấu trúc từ lamtao.vn.

## Đọc trước khi làm bất cứ việc gì
| File | Khi nào đọc |
|---|---|
| `PRD.md` | Hiểu sản phẩm, người dùng, phạm vi MVP |
| `ARCHITECTURE.md` | Stack, cấu trúc thư mục, mô hình dữ liệu, luồng dữ liệu |
| `DESIGN.md` | Trước khi viết bất kỳ UI nào |
| `RULES.md` | **Luôn luôn** — quy tắc code và danh sách điều cấm |
| `TASKS.md` | Chọn task tiếp theo chưa đánh dấu |
| `PROGRESS.md` | Biết đã làm gì, lỗi gì, đang dở chỗ nào |

Thứ tự ưu tiên khi các file mâu thuẫn: **RULES > PRD > ARCHITECTURE > DESIGN > TASKS**. Gặp mâu thuẫn thì dừng và hỏi.

## Vòng làm việc chuẩn
1. Đọc `PROGRESS.md` → xác định task tiếp theo trong `TASKS.md`.
2. Nêu ngắn kế hoạch cho task (file sẽ tạo/sửa, cách kiểm tra).
3. Thực hiện **chỉ** task đó.
4. Kiểm tra: `pnpm lint && pnpm typecheck && pnpm test` (+ chạy thử trên trình duyệt nếu là UI).
5. Đánh dấu `[x]` trong `TASKS.md`, thêm mục vào `PROGRESS.md` theo mẫu.
6. Tóm tắt cho người dùng: đã làm gì, cần họ làm gì (nếu có).

## Lệnh thường dùng
```bash
pnpm dev              # chạy dev server
pnpm build            # build production
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm test             # Vitest
pnpm test:e2e         # Playwright
pnpm db:migrate       # prisma migrate dev
pnpm db:seed          # nạp dữ liệu mẫu
pnpm db:studio        # Prisma Studio
```

## Bối cảnh nghiệp vụ cần nhớ
- Khách **không mua online**. Mục tiêu duy nhất của site công khai là khiến khách **gọi, nhắn Zalo hoặc gửi form báo giá**. Mọi trang phải có đường tới 3 hành động này trong 1 lần chạm.
- "Trang sản phẩm" thực chất là **trang danh mục** (ví dụ `/mo-da-doi/`): bài SEO dài + bảng thông số + gallery lớn + FAQ + khoảng giá. Không có trang chi tiết từng mẫu.
- Người dùng chính lớn tuổi, xem trên điện thoại → chữ to, nút to, ít bước.
- Thuật ngữ: *cải táng* (mộ bốc/sang cát), *an táng* (mộ hung/chôn lần đầu), *mái* (một mái, hai mái, ba mái), *Lỗ Ban* (thước đo phong thủy), *đá xanh rêu / đá xanh đen / granite*.
- Báo giá là **trọn gói nhưng không gồm phần móng** — giữ đúng câu này khi hiển thị quy trình.

## Ngôn ngữ
- Giao diện, nội dung, thông báo lỗi cho người dùng: **tiếng Việt có dấu**.
- Code, tên biến, comment, commit message: tiếng Anh (commit theo Conventional Commits, ví dụ `feat(lead): add quote form`).

## Nhắc lại điều cấm quan trọng nhất (chi tiết ở RULES.md §5)
Không lộ secret · không xóa dữ liệu/DB khi chưa xác nhận · không bịa giá, SĐT, giải thưởng, đánh giá như thật · không sao chép nội dung/ảnh của lamtao.vn · không lách lint/typecheck · không đổi stack.
