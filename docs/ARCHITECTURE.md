# ARCHITECTURE

## 1. Công nghệ
| Lớp | Lựa chọn | Lý do |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | SSR/SSG tốt cho SEO, một codebase cho site + admin |
| UI | **Tailwind CSS v4 + shadcn/ui** | Nhanh, nhất quán với DESIGN.md |
| Rich text (admin) | **Tiptap** | Soạn bài dài, bảng, ảnh; lưu JSON + render HTML |
| Database | **PostgreSQL** (Supabase/Neon) | Miễn phí giai đoạn đầu |
| ORM | **Prisma** | Schema rõ ràng, migration |
| Auth (admin) | **Auth.js (NextAuth v5)** – Credentials, mật khẩu bcrypt | Chỉ vài tài khoản nội bộ |
| Validation | **Zod** (dùng chung client/server) | |
| Form | **react-hook-form** | |
| Ảnh | **Cloudinary** (hoặc Supabase Storage) + `next/image` | Resize/WebP tự động |
| Email | **Resend** | Thông báo lead |
| Chống spam | **Cloudflare Turnstile** + honeypot + rate limit | |
| Lightbox | **yet-another-react-lightbox** | Gallery 60+ ảnh |
| Analytics | GA4 + sự kiện click Gọi/Zalo/Form | |
| Deploy | **Vercel** | |
| Test | Vitest (logic), Playwright (luồng chính) | |

## 2. Cấu trúc thư mục
```
.
├── AGENTS.md
├── docs/                        # PRD, ARCHITECTURE, DESIGN, RULES, TASKS, PROGRESS
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                  # dữ liệu mẫu
├── public/                      # logo, favicon, ảnh tĩnh
├── src/
│   ├── app/
│   │   ├── (site)/              # site công khai
│   │   │   ├── layout.tsx       # Header, Footer, FloatingContact
│   │   │   ├── page.tsx         # Trang chủ
│   │   │   ├── [slug]/page.tsx  # Danh mục HOẶC trang tĩnh (resolve theo slug)
│   │   │   ├── cong-trinh/page.tsx  & cong-trinh/[slug]/page.tsx
│   │   │   ├── tin-tuc/page.tsx     & tin-tuc/[slug]/page.tsx
│   │   │   ├── thu-vien-hinh-anh/page.tsx
│   │   │   └── lien-he/page.tsx
│   │   ├── admin/               # khu quản trị (bảo vệ bằng middleware)
│   │   │   ├── login/page.tsx
│   │   │   ├── page.tsx         # dashboard: lead mới, số liệu
│   │   │   ├── leads/  categories/  projects/  posts/
│   │   │   ├── testimonials/  banners/  pages/  settings/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── upload/route.ts  # ký upload Cloudinary
│   │   ├── sitemap.ts  robots.ts
│   ├── components/
│   │   ├── ui/                  # shadcn (không sửa tay nhiều)
│   │   ├── site/                # Header, MegaMenu, Hero, CategoryCard, ProjectCard,
│   │   │                        # Gallery, FAQ, SpecTable, QuoteForm, FloatingContact...
│   │   └── admin/               # DataTable, RichTextEditor, ImageUploader...
│   ├── server/
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── queries/             # hàm đọc dữ liệu (chỉ chạy server)
│   │   └── actions/             # Server Actions ghi dữ liệu (đã kiểm tra quyền)
│   ├── lib/                     # slugify, format giá, seo helpers, jsonld
│   ├── schemas/                 # Zod schemas
│   └── middleware.ts            # chặn /admin khi chưa đăng nhập
├── tests/  (unit, e2e)
└── .env.example
```

## 3. Mô hình dữ liệu (Prisma, rút gọn)
```
User         id, email, passwordHash, name, role(ADMIN|EDITOR), createdAt
Category     id, parentId?, name, slug(unique), excerpt, priceFrom?, priceTo?,
             content(Json), specs(Json: [{label,value}]), faqs(Json: [{q,a}]),
             coverImageId?, seoTitle?, seoDescription?, order, isPublished, menuGroup?
Image        id, url, publicId, alt, width, height, createdAt
CategoryImage   categoryId, imageId, caption?, order          # gallery
Project      id, title, slug, province, categoryId?, summary, content(Json),
             coverImageId?, completedAt?, isFeatured, isPublished, seo*
ProjectImage    projectId, imageId, caption?, order
Post         id, title, slug, excerpt, content(Json), coverImageId?, authorId,
             publishedAt?, seo*
Testimonial  id, name, province, content, rating?, avatarId?, order, isPublished
Banner       id, title, subtitle, ctaLabel, ctaHref, imageId?, isActive, order
Page         id, slug, title, content(Json), seo*                 # giới thiệu, chính sách...
Lead         id, name, phone, province?, categoryId?, message?, attachments(Json),
             sourceUrl, utm(Json?), status(NEW|CONTACTED|QUOTED|WON|LOST),
             note?, createdAt, updatedAt
SiteSetting  key(unique), value(Json)   # hotline, zalo, email, địa chỉ, giờ làm, mạng xã hội
```
Slug là duy nhất **trên toàn bộ** Category + Page (cùng chia sẻ route `/[slug]`) — kiểm tra trong server action trước khi lưu.

## 4. Luồng dữ liệu
**Đọc (site công khai)**
```
Request → app/(site)/... (Server Component) → server/queries/* → Prisma → Postgres
        → render HTML (ISR, revalidate theo tag) → CDN Vercel
```
- Trang dùng `export const revalidate = 3600` + `revalidateTag()` khi admin lưu → nội dung mới hiển thị ngay mà vẫn cache.

**Ghi (admin)**
```
Form admin (react-hook-form + Zod) → Server Action (kiểm tra session + role,
validate Zod lại) → Prisma → revalidateTag('category:<slug>' | 'projects' ...)
```

**Upload ảnh**
```
Admin chọn ảnh → POST /api/upload (cần session) trả chữ ký Cloudinary
→ trình duyệt upload thẳng lên Cloudinary → lưu bản ghi Image (url, publicId, kích thước, alt)
```

**Gửi yêu cầu báo giá**
```
QuoteForm → Server Action submitLead → kiểm Turnstile + honeypot + rate limit (IP/SĐT)
→ Zod validate (SĐT VN hợp lệ) → lưu Lead(status=NEW) → gửi email (Resend) [+ Telegram]
→ trả kết quả → UI hiện "Đã nhận, chúng tôi gọi lại trong 30 phút"
```
Gửi thông báo thất bại **không** được làm mất lead: lưu DB trước, thông báo sau (try/catch + log).

## 5. SEO
- `generateMetadata` cho mọi trang; canonical; OG image từ ảnh bìa.
- JSON-LD: `LocalBusiness` (layout), `BreadcrumbList`, `FAQPage` (danh mục có FAQ), `Article` (bài viết).
- `sitemap.ts` sinh từ DB; `robots.ts` chặn `/admin`, `/api`.
- Giữ được slug giống site cũ nếu migrate (ví dụ `/mo-da-doi/`) — bật `trailingSlash: true`.

## 6. Biến môi trường
```
DATABASE_URL, AUTH_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
RESEND_API_KEY, LEAD_NOTIFY_EMAIL, TELEGRAM_BOT_TOKEN?, TELEGRAM_CHAT_ID?,
TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_GA_ID
```
