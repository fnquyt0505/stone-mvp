import "server-only";
import { unstable_cache } from "next/cache";
import { cacheKey } from "@/server/cache-key";
import { db } from "@/server/db";

export const CATEGORIES_TAG = "categories";

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
};

/** Published top-level categories with their published children, in admin order. */
export const getMenuCategories = unstable_cache(
  async (): Promise<MenuCategory[]> =>
    db.category.findMany({
      where: { parentId: null, isPublished: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        children: {
          where: { isPublished: true },
          orderBy: [{ order: "asc" }, { name: "asc" }],
          select: { id: true, name: true, slug: true },
        },
      },
    }),
  cacheKey("menu-categories"),
  { tags: [CATEGORIES_TAG], revalidate: 3600 },
);
