# Hướng dẫn dùng trang quản trị

Tài liệu này dành cho nhân viên của xưởng. Không cần biết lập trình.

## 1. Đăng nhập

1. Mở địa chỉ: **`<tên miền website>/admin/login/`**
2. Nhập **email** và **mật khẩu** được cấp, bấm **Đăng nhập**.
3. Xong việc, bấm **Đăng xuất** ở góc trên bên phải (nhất là khi dùng máy chung).

Lưu ý:

- Nhập sai mật khẩu **10 lần trong 15 phút** sẽ bị khóa tạm **15 phút**.
- Có 2 loại tài khoản: **Quản trị viên** (làm được mọi việc, kể cả mục *Cài đặt*) và **Biên tập viên** (không thấy mục *Cài đặt*).
- Trên điện thoại, bấm nút **☰** ở góc trên bên trái để mở menu.

## 2. Tổng quan

Trang đầu tiên sau khi đăng nhập cho biết:

- Số yêu cầu báo giá **mới hôm nay**, **7 ngày qua**, và **đang chờ xử lý**.
- **5 yêu cầu gần nhất** — bấm vào số điện thoại màu đỏ để **gọi ngay**.
- Số danh mục, công trình, bài viết, đánh giá **đang hiện trên website**.

## 3. Yêu cầu báo giá (quan trọng nhất)

Mỗi khi khách gửi form báo giá trên website, một yêu cầu mới xuất hiện ở đây (và được gửi email/Telegram nếu đã cài đặt).

**Xử lý một yêu cầu:**

1. Vào **Yêu cầu báo giá**.
2. Bấm số điện thoại để **gọi**, hoặc bấm **Xử lý** để mở chi tiết.
3. Trong trang chi tiết có: thời gian gửi, tỉnh, loại sản phẩm khách quan tâm, nội dung khách viết, trang khách đang xem khi gửi.
4. Chọn **trạng thái** phù hợp và ghi **Ghi chú nội bộ** (nội dung cuộc gọi, hẹn khảo sát…), bấm **Lưu**.

| Trạng thái | Khi nào dùng |
|---|---|
| **Mới** | Chưa ai liên hệ |
| **Đã liên hệ** | Đã gọi / nhắn Zalo cho khách |
| **Đã báo giá** | Đã gửi báo giá |
| **Chốt** | Khách đồng ý làm |
| **Hủy** | Khách không làm nữa |

**Tìm và lọc:** chọn trạng thái, khoảng ngày, hoặc gõ tên / số điện thoại rồi bấm **Lọc**.

**Xuất Excel:** bấm **Xuất CSV** — tệp mở được bằng Excel, theo đúng bộ lọc đang chọn.

> Yêu cầu không xóa được — khách không còn quan tâm thì chuyển sang **Hủy**.

## 4. Danh mục sản phẩm

Danh mục chính là các "trang sản phẩm" trên website (ví dụ *Mộ đá đôi*). Có 2 cấp: **nhóm** (hiện thành cột trên menu, ví dụ *Lăng mộ đá*) và **danh mục con**.

**Thêm / sửa danh mục:** vào **Danh mục** → **Thêm danh mục** (hoặc bấm vào tên danh mục cần sửa).

- **Tên danh mục**: đường dẫn trang tự tạo theo tên (có thể sửa).
- **Thuộc nhóm**: để trống nếu đây là nhóm cấp 1.
- **Giá từ / Giá đến**: nhập theo **triệu đồng** (ví dụ `20` hoặc `1,5`). Để trống nếu chưa muốn hiện giá.
- **Ảnh bìa**: ảnh hiện trên thẻ danh mục.
- **Nội dung bài giới thiệu**: bài viết dài (xem mục 9 — Soạn nội dung).
- **Bảng thông số** và **Câu hỏi thường gặp**: bấm **Thêm…**, dùng nút **Lên / Xuống** để đổi thứ tự.
- **Thư viện ảnh**: bấm **Thêm ảnh**, chọn ảnh có sẵn hoặc tải ảnh mới. **Kéo thả** (hoặc nút mũi tên) để sắp xếp, ghi chú thích cho từng ảnh.
- **Hiển thị trên website**: bỏ chọn để tạm ẩn danh mục.

Bấm **Lưu danh mục** — website cập nhật ngay.

> Không xóa được nhóm còn danh mục con. Hạn chế **đổi đường dẫn** sau khi website đã chạy (đường dẫn cũ sẽ không còn mở được).

## 5. Công trình

Ảnh và thông tin các công trình đã làm (khách rất tin vào phần này).

- Bắt buộc chọn **tỉnh/thành** — khách lọc công trình theo tỉnh.
- **Loại sản phẩm** liên kết công trình với danh mục.
- Chọn **Công trình tiêu biểu** để hiện ở trang chủ.
- Thêm nhiều ảnh thật vào **Thư viện ảnh**.

## 6. Bài viết (Tin tức)

- **Ngày giờ đăng (giờ Việt Nam)**:
  - Để **trống** → bài là **nháp**, chưa hiện trên website.
  - Chọn **thời điểm trong tương lai** → bài **tự đăng** khi đến giờ (trễ tối đa khoảng 10 phút).
  - Chọn thời điểm đã qua → bài hiện ngay.
- Danh sách bài ghi rõ: **Nháp** / **Hẹn đăng …** / **Đã đăng**.

## 7. Trang tĩnh

Các trang như *Giới thiệu*, *Chính sách bảo mật*… Sửa nội dung giống bài viết.

> Một số đường dẫn đã dùng cho trang có sẵn (ví dụ `lien-he`, `cong-trinh`, `tin-tuc`) nên không đặt được.

## 8. Đánh giá, Banner, Thư viện ảnh

- **Đánh giá**: chỉ đăng **đánh giá thật, đã được khách đồng ý**. Trang chủ hiện 3 đánh giá có **thứ tự** nhỏ nhất.
- **Banner**: dải khuyến mãi trên cùng mọi trang. Chỉ banner **đang bật** có thứ tự nhỏ nhất được hiện. Liên kết của nút: `tel:0912345678` (gọi), `/lien-he/` (trang trong web) hoặc `https://…`.
- **Thư viện ảnh**: tải ảnh lên trước để dùng ở nhiều nơi. Mỗi ảnh **bắt buộc có mô tả** (ví dụ *Mộ đá đôi xanh rêu tại Ninh Bình*) — giúp Google hiểu ảnh và người khiếm thị nghe được. Nhận JPG, PNG, WebP, AVIF, tối đa 10 MB/ảnh.

## 9. Soạn nội dung

Thanh công cụ phía trên ô soạn thảo:

| Nút | Tác dụng |
|---|---|
| **B / I / U** | Chữ đậm / nghiêng / gạch chân |
| **H2 / H3** | Tiêu đề lớn / tiêu đề nhỏ trong bài |
| Danh sách | Gạch đầu dòng hoặc đánh số |
| Trích dẫn | Đoạn trích nổi bật |
| Liên kết | Chọn chữ rồi bấm, nhập địa chỉ |
| Chèn ảnh | Chọn ảnh trong thư viện hoặc tải mới |
| Chèn bảng | Bảng kích thước, bảng giá… (thêm/bớt hàng, cột ngay trên thanh công cụ) |
| ↶ / ↷ | Hoàn tác / làm lại |

## 10. Cài đặt (chỉ Quản trị viên)

Thông tin dùng trên **mọi trang**: tên thương hiệu, hotline, số Zalo, email, địa chỉ, giờ làm việc, mạng xã hội, số liệu thành tích, người biên soạn nội dung.

- **Bản đồ**: trên Google Maps chọn **Chia sẻ → Nhúng bản đồ → Sao chép HTML**, rồi dán nguyên vào ô *Bản đồ Google Maps*.
- **Thành tích**: chỉ ghi số liệu thật, chứng minh được.
- **Website đang dùng dữ liệu mẫu**: khi còn chọn, Google **không** đưa website lên kết quả tìm kiếm. **Chỉ bỏ chọn khi đã thay hết nội dung `[MẪU]`.**

## Khi gặp sự cố

- Lưu không được: đọc dòng chữ **đỏ** ở đầu form và dưới từng ô — sửa đúng ô báo lỗi rồi lưu lại. Nội dung đã nhập **không bị mất**.
- Website chưa thấy thay đổi: tải lại trang (F5). Thay đổi trong admin hiện gần như ngay lập tức.
- Quên mật khẩu: nhờ người quản lý kỹ thuật đặt lại.
