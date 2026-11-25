# DESIGN

## 1. Tinh thần
Trang nghiêm, bền vững, thủ công — như chính chất liệu đá. Tông tối giản, nhiều ảnh thật, chữ to dễ đọc cho người lớn tuổi. Không dùng hiệu ứng lòe loẹt; điểm nhấn duy nhất là màu vàng đồng cho CTA và chi tiết trang trí.

## 2. Màu sắc
| Token | Hex | Dùng cho |
|---|---|---|
| `--stone-900` | `#1F2420` | Chữ chính, header nền tối, footer |
| `--stone-700` | `#3E4741` | Chữ phụ, icon |
| `--stone-500` | `#7A847D` | Chữ mờ, viền đậm |
| `--stone-200` | `#DCDFD9` | Viền, đường kẻ |
| `--stone-50`  | `#F6F5F1` | Nền section xen kẽ (màu đá trắng ngà) |
| `--white` | `#FFFFFF` | Nền chính, thẻ |
| `--jade-700` | `#2F5D50` | Màu thương hiệu (đá xanh rêu): link, tiêu đề phụ, badge |
| `--jade-50`  | `#E8F0EC` | Nền nhẹ cho khối thông tin |
| `--gold-600` | `#B08A3E` | CTA chính, đường trang trí, số liệu nổi bật |
| `--gold-700` | `#8F6E2C` | Hover CTA |
| `--red-600`  | `#C0392B` | Nút **Gọi ngay** (khẩn, chuyển đổi), lỗi form |
| `--zalo`     | `#0068FF` | Nút Zalo |
| `--success`  | `#2E7D4F` | Thông báo thành công |

Tương phản: chữ trên nền phải đạt WCAG AA (≥ 4.5:1). Chữ trắng trên `--gold-600` chỉ dùng cỡ ≥ 16px đậm; nếu không đủ, dùng `--stone-900` trên nền vàng.

## 3. Font chữ
- **Tiêu đề:** `Lora` (serif, hỗ trợ tiếng Việt đầy đủ) — 600/700.
- **Nội dung & UI:** `Be Vietnam Pro` — 400/500/600.
- Nạp bằng `next/font/google` với `subsets: ['vietnamese', 'latin']`, `display: 'swap'`.

| Cấp | Mobile | Desktop | Line-height |
|---|---|---|---|
| H1 | 28px | 40px | 1.25 |
| H2 | 24px | 32px | 1.3 |
| H3 | 20px | 24px | 1.35 |
| Body | **17px** | 18px | 1.7 |
| Small | 14px | 15px | 1.5 |

Body tối thiểu 17px vì người dùng chính là người lớn tuổi. Độ dài dòng bài viết ≤ 75 ký tự (`max-w-prose`).

## 4. Khoảng cách, bo góc, đổ bóng
- Thang khoảng cách Tailwind mặc định (4px). Section: `py-12` mobile / `py-20` desktop.
- Container: `max-w-7xl px-4 md:px-6`.
- Bo góc: thẻ `rounded-lg` (8px), nút `rounded-md`, ảnh trong gallery `rounded-md`.
- Bóng: chỉ `shadow-sm` cho thẻ, `shadow-lg` cho mega menu và popup.
- Họa tiết: đường kẻ vàng mảnh 48×2px dưới tiêu đề section (chi tiết nhận diện duy nhất).

## 5. Component
| Component | Mô tả |
|---|---|
| **TopBar** | Dải mảnh nền `--stone-900`: giờ làm việc, hotline, email |
| **PromoBanner** | Dải khuyến mãi (cấu hình từ admin) + nút "Gọi ngay" |
| **Header** | Logo trái, menu giữa, nút hotline phải; dính khi cuộn; nền trắng |
| **MegaMenu** | Desktop: panel nhiều cột theo nhóm, có ảnh đại diện nhóm. Mobile: drawer trượt từ trái, accordion |
| **Hero** | Ảnh công trình toàn chiều rộng, lớp phủ tối 40%, H1 + 2 CTA (Nhận báo giá / Gọi ngay) |
| **CategoryCard** | Ảnh 4:3, tên, mô tả 1 dòng, "Giá từ …", link "Xem mẫu →" |
| **ProjectCard** | Ảnh 3:2, badge tỉnh, tên công trình, năm hoàn thành |
| **SpecTable** | Bảng 2 cột label/value, nền xen kẽ `--stone-50` |
| **Gallery** | Lưới 2/3/4 cột (mobile/tablet/desktop), lazy load, mở lightbox, có chú thích |
| **FAQ** | Accordion, chỉ một mục mở một lúc |
| **TestimonialCard** | Trích dẫn, tên + tỉnh, (sao) |
| **ProcessSteps** | Timeline 7 bước đặt hàng, ngang trên desktop, dọc trên mobile |
| **QuoteForm** | Họ tên, SĐT, Tỉnh/thành (select), Loại sản phẩm (select), Ghi chú, Ảnh tham khảo; nút vàng full-width |
| **FloatingContact** | Desktop: cột nút tròn phải-dưới (Gọi đỏ có hiệu ứng rung nhẹ, Zalo xanh, TikTok, lên đầu). Mobile: thay bằng **StickyBottomBar** 3 ô: Gọi · Zalo · Báo giá |
| **Breadcrumb** | Nhỏ, `--stone-500`, phân cách `/` |
| **PriceRange** | Khối nền `--jade-50`: "Giá tham khảo: 20 – 50 triệu" + link bảng giá + nút Zalo |
| **AuthorBox** | Ảnh, tên, vai trò, mô tả ngắn (E-E-A-T cho SEO) |
| **Footer** | Nền `--stone-900`: địa chỉ trụ sở/xưởng/chi nhánh, hotline, giờ làm, link chính sách, mạng xã hội, bản đồ nhỏ |

Admin dùng shadcn/ui mặc định (nền trắng, `--jade-700` làm primary), ưu tiên rõ ràng hơn đẹp.

## 6. Ảnh
- Tỉ lệ cố định cho mỗi loại thẻ để lưới không lệch.
- Mọi ảnh có `alt` mô tả tiếng Việt (bắt buộc ở admin).
- Định dạng WebP/AVIF qua `next/image`; ảnh hero `priority`.

## 7. Giọng văn
Lịch sự, chân thành, xưng "chúng tôi" – gọi khách là "Quý khách". Tránh từ ngữ quảng cáo phóng đại. CTA ngắn, động từ rõ: "Gọi ngay", "Nhận báo giá", "Xem mẫu".

## 8. Responsive & truy cập
- Mobile-first; breakpoint `sm 640 / md 768 / lg 1024 / xl 1280`.
- Vùng chạm ≥ 44×44px. Focus ring rõ ràng (`--gold-600`).
- Không dùng màu làm tín hiệu duy nhất; icon luôn có nhãn hoặc `aria-label`.
