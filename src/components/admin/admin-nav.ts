import type { StaffRole } from "@/auth.config";

export type AdminNavItem = {
  href: string;
  label: string;
  icon:
    | "dashboard"
    | "leads"
    | "categories"
    | "projects"
    | "posts"
    | "pages"
    | "testimonials"
    | "banners"
    | "settings";
  /** Roles allowed to see the item (default: all staff). */
  roles?: StaffRole[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin/", label: "Tổng quan", icon: "dashboard" },
  { href: "/admin/leads/", label: "Yêu cầu báo giá", icon: "leads" },
  { href: "/admin/categories/", label: "Danh mục", icon: "categories" },
  { href: "/admin/projects/", label: "Công trình", icon: "projects" },
  { href: "/admin/posts/", label: "Bài viết", icon: "posts" },
  { href: "/admin/pages/", label: "Trang tĩnh", icon: "pages" },
  { href: "/admin/testimonials/", label: "Đánh giá", icon: "testimonials" },
  { href: "/admin/banners/", label: "Banner", icon: "banners" },
  { href: "/admin/settings/", label: "Cài đặt", icon: "settings", roles: ["ADMIN"] },
];

export function navForRole(role: StaffRole): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => !item.roles || item.roles.includes(role));
}
