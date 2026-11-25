/**
 * Sample (development) data. Everything a visitor could mistake for a real
 * business claim is tagged "[MẪU]" (docs/RULES.md §5.6). Replace via admin
 * before launch. Prices are placeholders in VND, not real quotes.
 */

export const SAMPLE = "[MẪU]";

type Spec = { label: string; value: string };
type Faq = { q: string; a: string };

export type SeedCategory = {
  slug: string;
  name: string;
  excerpt: string;
  priceFrom?: number;
  priceTo?: number;
  specs?: Spec[];
  faqs?: Faq[];
};

export type SeedGroup = SeedCategory & { menuGroup: string; children: SeedCategory[] };

const MILLION = 1_000_000;

const sampleSpecs = (material: string): Spec[] => [
  { label: "Chất liệu", value: `${SAMPLE} ${material}` },
  { label: "Kích thước", value: `${SAMPLE} Theo thước Lỗ Ban, tư vấn theo khuôn viên` },
  { label: "Hoàn thiện", value: `${SAMPLE} Mài bóng hoặc mài mờ, chạm khắc thủ công` },
  { label: "Thời gian thi công", value: `${SAMPLE} Tùy quy mô công trình` },
];

const sampleFaqs: Faq[] = [
  {
    q: "Báo giá đã gồm những gì?",
    a: `${SAMPLE} Báo giá trọn gói gồm chế tác, vận chuyển và lắp đặt, không gồm phần móng.`,
  },
  {
    q: "Có được chọn kích thước theo thước Lỗ Ban không?",
    a: `${SAMPLE} Có. Chúng tôi tư vấn kích thước theo cung đẹp của thước Lỗ Ban.`,
  },
  {
    q: "Nên chọn đá xanh rêu hay granite?",
    a: `${SAMPLE} Đá xanh rêu mang vẻ cổ kính, granite bền màu và dễ vệ sinh. Quý khách có thể xem mẫu thực tế trước khi quyết định.`,
  },
];

const child = (
  slug: string,
  name: string,
  priceFrom: number,
  priceTo: number,
  material = "Đá xanh rêu / đá xanh đen / granite",
): SeedCategory => ({
  slug,
  name,
  excerpt: `${SAMPLE} Mô tả ngắn cho danh mục ${name.toLowerCase()}.`,
  priceFrom: priceFrom * MILLION,
  priceTo: priceTo * MILLION,
  specs: sampleSpecs(material),
  faqs: sampleFaqs,
});

export const CATEGORY_GROUPS: SeedGroup[] = [
  {
    slug: "lang-mo-da",
    name: "Lăng mộ đá",
    menuGroup: "Lăng mộ đá",
    excerpt: `${SAMPLE} Mộ đá, lăng thờ và khu lăng mộ gia đình, dòng họ.`,
    children: [
      child("mo-da-don", "Mộ đá đơn", 10, 30),
      child("mo-da-doi", "Mộ đá đôi", 20, 50),
      child("mo-da-ba-mai", "Mộ đá ba mái", 30, 80),
      child("lang-tho-da", "Lăng thờ đá", 40, 120),
      child("khu-lang-mo-da", "Khu lăng mộ đá", 150, 600),
    ],
  },
  {
    slug: "nha-tho-ho",
    name: "Nhà thờ họ",
    menuGroup: "Nhà thờ họ",
    excerpt: `${SAMPLE} Nhà thờ họ, từ đường bằng đá.`,
    children: [
      child("nha-tho-ho-bang-da", "Nhà thờ họ bằng đá", 300, 1500),
      child("lang-tho-chung", "Lăng thờ chung dòng họ", 80, 300),
    ],
  },
  {
    slug: "da-granite",
    name: "Đá granite",
    menuGroup: "Đá granite",
    excerpt: `${SAMPLE} Mộ và bia mộ đá granite tự nhiên.`,
    children: [
      child("mo-da-granite", "Mộ đá granite", 25, 90, "Granite tự nhiên"),
      child("bia-mo-granite", "Bia mộ granite", 2, 10, "Granite tự nhiên"),
    ],
  },
  {
    slug: "tuong-da",
    name: "Tượng đá",
    menuGroup: "Tượng đá",
    excerpt: `${SAMPLE} Tượng Phật, tượng thánh và linh vật bằng đá.`,
    children: [
      child("tuong-phat-da", "Tượng Phật đá", 15, 200),
      child("linh-vat-da", "Linh vật đá", 10, 100),
    ],
  },
  {
    slug: "do-tho-da",
    name: "Đồ thờ đá",
    menuGroup: "Đồ thờ đá",
    excerpt: `${SAMPLE} Bàn thờ, cuốn thư, lư hương bằng đá.`,
    children: [
      child("ban-tho-da", "Bàn thờ đá", 5, 40),
      child("cuon-thu-da", "Cuốn thư đá", 8, 60),
    ],
  },
  {
    slug: "kien-truc-da",
    name: "Kiến trúc đá",
    menuGroup: "Kiến trúc đá",
    excerpt: `${SAMPLE} Cổng, lan can, cột và tiểu cảnh sân vườn bằng đá.`,
    children: [child("cong-da", "Cổng đá", 50, 400), child("lan-can-da", "Lan can đá", 3, 20)],
  },
];

export const PROJECTS = [
  {
    slug: "mau-mo-da-doi-ninh-binh",
    title: "Mộ đá đôi",
    province: "Ninh Bình",
    categorySlug: "mo-da-doi",
    featured: true,
  },
  {
    slug: "mau-lang-tho-da-thanh-hoa",
    title: "Lăng thờ đá",
    province: "Thanh Hóa",
    categorySlug: "lang-tho-da",
    featured: true,
  },
  {
    slug: "mau-nha-tho-ho-hung-yen",
    title: "Nhà thờ họ bằng đá",
    province: "Hưng Yên",
    categorySlug: "nha-tho-ho-bang-da",
    featured: true,
  },
  {
    slug: "mau-khu-lang-mo-ha-noi",
    title: "Khu lăng mộ đá",
    province: "Hà Nội",
    categorySlug: "khu-lang-mo-da",
    featured: false,
  },
  {
    slug: "mau-mo-granite-hai-phong",
    title: "Mộ đá granite",
    province: "Hải Phòng",
    categorySlug: "mo-da-granite",
    featured: false,
  },
  {
    slug: "mau-cong-da-nghe-an",
    title: "Cổng đá",
    province: "Nghệ An",
    categorySlug: "cong-da",
    featured: false,
  },
] as const;

export const TESTIMONIALS = [
  { id: "seed-testimonial-1", name: "Khách hàng A", province: "Ninh Bình" },
  { id: "seed-testimonial-2", name: "Khách hàng B", province: "Phú Thọ" },
  { id: "seed-testimonial-3", name: "Khách hàng C", province: "Bắc Ninh" },
] as const;

export const POSTS = [
  {
    slug: "mau-cach-chon-kich-thuoc-mo-theo-lo-ban",
    title: "Cách chọn kích thước mộ theo thước Lỗ Ban",
  },
  { slug: "mau-phan-biet-mo-cai-tang-va-an-tang", title: "Phân biệt mộ cải táng và mộ an táng" },
  { slug: "mau-so-sanh-da-xanh-reu-va-granite", title: "So sánh đá xanh rêu và đá granite" },
] as const;

/** Site settings. Contact values are obvious placeholders, never real numbers. */
export const SITE_SETTINGS: Record<string, unknown> = {
  isSampleData: true,
  brandName: `${SAMPLE} Xưởng đá mỹ nghệ`,
  hotline: "0900000000",
  zalo: "0900000000",
  email: "lienhe@example.com",
  address: `${SAMPLE} Địa chỉ xưởng sẽ cập nhật`,
  workingHours: `${SAMPLE} 7:00 – 21:00, tất cả các ngày`,
  social: { facebook: "", tiktok: "", youtube: "" },
  /** Placeholder figures only — replace with verified numbers before launch. */
  achievements: [
    { value: "[MẪU] 00+", label: "Năm kinh nghiệm" },
    { value: "[MẪU] 000+", label: "Công trình đã thi công" },
    { value: "[MẪU] 00", label: "Tỉnh thành phục vụ" },
    { value: "[MẪU] 0 năm", label: "Bảo hành kết cấu" },
  ],
};
