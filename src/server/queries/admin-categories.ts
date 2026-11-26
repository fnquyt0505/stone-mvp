import "server-only";
import { db } from "@/server/db";

/** Two-level tree for the admin list (unpublished included). Not cached. */
export async function listAdminCategoryTree() {
  return db.category.findMany({
    where: { parentId: null },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      order: true,
      isPublished: true,
      _count: { select: { gallery: true } },
      children: {
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          order: true,
          isPublished: true,
          priceFrom: true,
          priceTo: true,
          _count: { select: { gallery: true } },
        },
      },
    },
  });
}

/** Top-level categories usable as a parent (excluding `excludeId`). */
export async function listParentOptions(excludeId?: string) {
  return db.category.findMany({
    where: { parentId: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
}

const imageSelect = { id: true, url: true, alt: true, width: true, height: true } as const;

export async function getAdminCategory(id: string) {
  if (!/^[a-z0-9]{20,40}$/.test(id)) return null;
  return db.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      menuGroup: true,
      excerpt: true,
      priceFrom: true,
      priceTo: true,
      content: true,
      specs: true,
      faqs: true,
      seoTitle: true,
      seoDescription: true,
      order: true,
      isPublished: true,
      coverImage: { select: imageSelect },
      gallery: {
        orderBy: { order: "asc" },
        select: { caption: true, image: { select: imageSelect } },
      },
      _count: { select: { children: true } },
    },
  });
}

export type AdminCategory = NonNullable<Awaited<ReturnType<typeof getAdminCategory>>>;
