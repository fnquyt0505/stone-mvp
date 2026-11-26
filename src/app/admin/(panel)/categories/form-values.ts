import { parseFaqs, parseSpecs } from "@/schemas/category";
import type { AdminCategory } from "@/server/queries/admin-categories";
import type { CategoryFormValues } from "./category-form";

const MILLION = 1_000_000;

/** VND integer -> "triệu" string for the form (input also accepts "1,5"). */
function toMillions(value: number | null): string {
  if (value === null) return "";
  return String(Math.round((value / MILLION) * 100) / 100);
}

export const EMPTY_CATEGORY: CategoryFormValues = {
  name: "",
  slug: "",
  parentId: "",
  menuGroup: "",
  excerpt: "",
  priceFrom: "",
  priceTo: "",
  content: null,
  specs: [],
  faqs: [],
  cover: null,
  gallery: [],
  seoTitle: "",
  seoDescription: "",
  order: 0,
  isPublished: false,
  hasChildren: false,
};

export function toCategoryFormValues(c: AdminCategory): CategoryFormValues {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId ?? "",
    menuGroup: c.menuGroup ?? "",
    excerpt: c.excerpt ?? "",
    priceFrom: toMillions(c.priceFrom),
    priceTo: toMillions(c.priceTo),
    content: c.content,
    specs: parseSpecs(c.specs),
    faqs: parseFaqs(c.faqs),
    cover: c.coverImage,
    gallery: c.gallery.map((g) => ({ image: g.image, caption: g.caption ?? "" })),
    seoTitle: c.seoTitle ?? "",
    seoDescription: c.seoDescription ?? "",
    order: c.order,
    isPublished: c.isPublished,
    hasChildren: c._count.children > 0,
  };
}
