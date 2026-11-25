/** Static site links. Category navigation (MegaMenu) is data-driven (T07). */
export const MAIN_NAV = [
  { href: "/gioi-thieu/", label: "Giới thiệu" },
  { href: "/cong-trinh/", label: "Công trình" },
  { href: "/huong-dan-dat-hang/", label: "Đặt hàng" },
  { href: "/tin-tuc/", label: "Tin tức" },
  { href: "/lien-he/", label: "Liên hệ" },
] as const;

export const POLICY_NAV = [
  { href: "/chinh-sach-bao-mat/", label: "Chính sách bảo mật" },
  { href: "/dieu-khoan-su-dung/", label: "Điều khoản sử dụng" },
  { href: "/chinh-sach-cookie/", label: "Chính sách cookie" },
  { href: "/mien-tru-trach-nhiem/", label: "Miễn trừ trách nhiệm" },
] as const;

export const EXPLORE_NAV = [
  { href: "/cong-trinh/", label: "Công trình đã thi công" },
  { href: "/thu-vien-hinh-anh/", label: "Thư viện hình ảnh" },
  { href: "/tin-tuc/", label: "Tin tức & kinh nghiệm" },
  { href: "/huong-dan-dat-hang/", label: "Hướng dẫn đặt hàng" },
] as const;
