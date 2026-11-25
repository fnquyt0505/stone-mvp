# PRD — Website xưởng đá mỹ nghệ (MVP, tham chiếu lamtao.vn)

## 1. Tóm tắt
Website giới thiệu và **thu lead** cho một xưởng chế tác đá mỹ nghệ (lăng mộ đá, nhà thờ họ, tượng đá, đồ thờ, kiến trúc đá). Khách không mua trực tiếp trên web: họ xem mẫu, xem công trình đã làm, rồi **gọi / nhắn Zalo / gửi yêu cầu báo giá**. Mục tiêu kinh doanh: tối đa số cuộc gọi và yêu cầu báo giá chất lượng, đồng thời xếp hạng cao trên Google cho các từ khóa như "mộ đá đôi", "lăng thờ đá", "nhà thờ họ bằng đá".

## 2. Phân tích site tham chiếu (lamtao.vn)
| Nhóm | Những gì site đang có | Ghi chú cho MVP |
|---|---|---|
| Danh mục sản phẩm | Mega menu 6 nhóm (Lăng mộ đá, Nhà thờ họ, Đá granite, Tượng đá, Đồ thờ đá, Kiến trúc đá), ~60 trang danh mục con | Làm danh mục 2 cấp, quản lý từ admin |
| Trang danh mục | Breadcrumb, H1, đoạn giới thiệu + khoảng giá ("20–50 triệu"), bảng thông số, bài viết SEO dài, thư viện 60–70 ảnh, bảng kích thước Lỗ Ban, FAQ, thẻ danh mục liên quan ("giá từ…"), bài liên quan, hộp tác giả, bản đồ | Đây là "trang sản phẩm" thực sự — **không có trang chi tiết từng sản phẩm** |
| Công trình | Bài dự án theo tỉnh, ảnh + mô tả | Làm module Dự án có lọc theo tỉnh/loại |
| Uy tín | 3 đánh giá khách hàng, trang danh hiệu/thành tích | Module Testimonial + trang Giới thiệu |
| Khuyến mãi | Banner "Tặng bộ bản vẽ 2D + mặt bằng + phối cảnh 3D trị giá 3.000.000đ" + nút GỌI NGAY | Banner cấu hình được |
| Liên hệ | Hotline, Zalo, TikTok, email, Google Map, giờ làm 7:00–23:00; nút nổi bên phải | Giữ nguyên + **thêm form báo giá** (site gốc chưa có) |
| Đặt hàng | Trang hướng dẫn 7 bước: yêu cầu → khảo sát → bản vẽ → báo giá trọn gói (không gồm móng) → hợp đồng + cọc → sản xuất & lắp đặt → nghiệm thu & thanh toán | Trang tĩnh + timeline |
| Blog | Tin tức, Thư viện hình ảnh, Thư viện thiết kế | Blog + thư viện ảnh |
| Pháp lý | Giới thiệu, Liên hệ, Bảo mật, Điều khoản, Cookie, Miễn trừ | Trang tĩnh |
| Tài khoản | Không có đăng nhập cho khách | Chỉ admin đăng nhập |
| Kỹ thuật | WordPress + Elementor + GeneratePress | Thay bằng stack hiện đại (xem ARCHITECTURE.md) |

**Điểm yếu của site gốc mà MVP nên làm tốt hơn:** không có form báo giá (mất lead ngoài giờ), không có công cụ tra kích thước Lỗ Ban tương tác, không lọc được công trình, một số menu trỏ về "#", không có trang quản lý lead.

## 3. Người dùng
1. **Gia đình / dòng họ** cần xây, sửa, cải táng mộ, lăng thờ, nhà thờ họ — thường 35–65 tuổi, xem trên điện thoại, tin vào ảnh công trình thật và lời khuyên phong thủy.
2. **Cộng đồng tôn giáo** (Phật giáo, Công giáo) cần tượng, mộ theo nghi thức riêng.
3. **Chủ biệt thự / sân vườn** cần đá ốp, lan can, cột, đài phun nước, chậu đá.
4. **Đơn vị công** (nghĩa trang liệt sĩ, khu tưởng niệm, đền chùa).
5. **Admin / nhân viên kinh doanh** của xưởng: đăng nội dung, xử lý lead.

## 4. Phạm vi MVP
### Phải có (P0)
- Trang chủ: hero + banner khuyến mãi, lưới danh mục, công trình tiêu biểu, đánh giá, thành tích, quy trình đặt hàng rút gọn, CTA.
- Danh mục 2 cấp với mega menu; trang danh mục theo cấu trúc ở mục 2 (nội dung rich text, bảng thông số, gallery có lightbox, FAQ, danh mục liên quan, khoảng giá "từ…").
- Module Công trình: danh sách + lọc theo tỉnh và loại; trang chi tiết có gallery.
- Form **Yêu cầu báo giá** (họ tên, SĐT, tỉnh/thành, loại sản phẩm, kích thước/ghi chú, ảnh tham khảo tùy chọn) — có ở trang danh mục, trang liên hệ và popup.
- Nút liên hệ nổi: Gọi, Zalo, (TikTok), lên đầu trang. Thanh CTA dính đáy màn hình trên mobile.
- Blog cơ bản + thư viện ảnh.
- Trang tĩnh: Giới thiệu, Hướng dẫn đặt hàng, Liên hệ (bản đồ), các trang chính sách.
- SEO: URL slug tiếng Việt không dấu, meta title/description, Open Graph, sitemap.xml, robots.txt, JSON-LD (LocalBusiness, BreadcrumbList, FAQPage, Article).
- Admin: đăng nhập; CRUD danh mục, công trình, bài viết, đánh giá, banner, cài đặt site (hotline, Zalo, địa chỉ, giờ làm); upload ảnh; **danh sách lead** với trạng thái (Mới → Đã liên hệ → Đã báo giá → Chốt / Hủy).
- Thông báo lead mới qua email (và Telegram nếu kịp).

### Nên có (P1, sau MVP)
- Công cụ tra kích thước Lỗ Ban (nhập loại mộ → gợi ý kích thước đẹp).
- Tìm kiếm toàn site.
- Theo dõi click Gọi/Zalo (analytics event).
- Đa chi nhánh / nhiều số hotline.

### Không làm trong MVP
Giỏ hàng, thanh toán online, tài khoản khách, đa ngôn ngữ, chat realtime tự xây, ứng dụng di động.

## 5. User stories chính
- Là khách xem trên điện thoại, tôi bấm 1 lần là gọi được hotline hoặc mở Zalo, từ bất kỳ trang nào.
- Là khách, tôi xem được khoảng giá và ảnh mẫu thật trước khi liên hệ.
- Là khách, tôi gửi yêu cầu báo giá lúc 23h mà không cần gọi, và nhận xác nhận đã gửi.
- Là khách, tôi xem công trình đã làm gần tỉnh của mình.
- Là admin, tôi tạo trang danh mục mới với ảnh, FAQ, bảng thông số mà không cần lập trình.
- Là nhân viên kinh doanh, tôi thấy lead mới ngay, đổi trạng thái và ghi chú cuộc gọi.

## 6. Chỉ số thành công
- Tỷ lệ chuyển đổi (gọi + Zalo + form) / phiên ≥ 3%.
- LCP < 2,5s trên 4G, Lighthouse SEO ≥ 95, Performance ≥ 85 (mobile).
- 100% lead từ form được lưu và gửi thông báo trong < 1 phút.

## 7. Giả định & câu hỏi mở
- Nội dung (ảnh, bài viết) do chủ xưởng cung cấp; MVP dùng dữ liệu mẫu.
- Không hiển thị giá cụ thể từng mẫu, chỉ khoảng giá "từ…".
- Cần chốt: tên thương hiệu, logo, số hotline/Zalo, có chuyển dữ liệu từ WordPress cũ không.
