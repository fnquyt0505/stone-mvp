# AGENTS.md — Hướng dẫn cho AI coding agent

Bạn đang xây MVP website giới thiệu và thu lead cho một **xưởng đá mỹ nghệ** (lăng mộ đá, nhà thờ họ, tượng đá, đồ thờ, kiến trúc đá), lấy cảm hứng cấu trúc từ lamtao.vn.

## Đọc trước khi làm bất cứ việc gì
| File | Khi nào đọc |
|---|---|
| `docs/PRD.md` | Hiểu sản phẩm, người dùng, phạm vi MVP |
| `docs/ARCHITECTURE.md` | Stack, cấu trúc thư mục, mô hình dữ liệu, luồng dữ liệu |
| `docs/DESIGN.md` | Trước khi viết bất kỳ UI nào |
| `docs/RULES.md` | **Luôn luôn** — quy tắc code và danh sách điều cấm |
| `docs/TASKS.md` | Chọn task tiếp theo chưa đánh dấu |
| `docs/PROGRESS.md` | Biết đã làm gì, lỗi gì, đang dở chỗ nào |

Thứ tự ưu tiên khi các file mâu thuẫn: **RULES > PRD > ARCHITECTURE > DESIGN > TASKS**. Gặp mâu thuẫn thì dừng và hỏi.

## Vòng làm việc chuẩn
1. Đọc `docs/PROGRESS.md` → xác định task tiếp theo trong `docs/TASKS.md`.
2. Nêu ngắn kế hoạch cho task (file sẽ tạo/sửa, cách kiểm tra).
3. Tạo nhánh mới từ `main` mới nhất: `git checkout main && git pull && git checkout -b task/Txx-<slug>` (ví dụ `task/T02-design-tokens`).
4. Thực hiện **chỉ** task đó.
5. Kiểm tra: `pnpm lint && pnpm typecheck && pnpm test` (+ chạy thử trên trình duyệt nếu là UI).
6. Đánh dấu `[x]` trong `docs/TASKS.md`, thêm mục vào `docs/PROGRESS.md` theo mẫu — commit chung trong nhánh task.
7. Push nhánh và mở PR vào `main`: `git push -u origin HEAD && gh pr create --fill --base main`. Workflow `.github/workflows/ci.yml` chạy lint/typecheck/test/build; **pass thì tự squash-merge và xóa nhánh**. Theo dõi bằng `gh pr checks --watch`; CI đỏ thì sửa trên cùng nhánh rồi push lại. Không commit thẳng lên `main`.
8. Tóm tắt cho người dùng: đã làm gì, link PR, cần họ làm gì (nếu có).

## Lệnh thường dùng
```bash
pnpm dev              # chạy dev server
pnpm build            # build production
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm test             # Vitest
pnpm test:e2e         # Playwright
pnpm db:up            # bật Postgres local (docker compose)
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

## Nhắc lại điều cấm quan trọng nhất (chi tiết ở docs/RULES.md §5)
Không lộ secret · không xóa dữ liệu/DB khi chưa xác nhận · không bịa giá, SĐT, giải thưởng, đánh giá như thật · không sao chép nội dung/ảnh của lamtao.vn · không lách lint/typecheck · không đổi stack.
