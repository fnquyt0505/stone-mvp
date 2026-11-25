import "server-only";
import { unstable_cache } from "next/cache";
import { cacheKey } from "@/server/cache-key";
import { db } from "@/server/db";
import { CATEGORIES_TAG } from "./categories";
import type { HomeCategory } from "./home";

/**
 * Related categories: siblings under the same parent (or the children when the
 * category is itself a group), excluding the current one.
 */
export const getRelatedCategories = unstable_cache(
  async (categoryId: string, parentId: string | null, limit = 6): Promise<HomeCategory[]> => {
    const rows = await db.category.findMany({
      where: {
        isPublished: true,
        id: { not: categoryId },
        parentId: parentId ?? categoryId,
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        excerpt: true,
        priceFrom: true,
        coverImage: { select: { url: true, alt: true, width: true, height: true } },
      },
    });
    return rows.map(({ coverImage, ...c }) => ({ ...c, image: coverImage }));
  },
  cacheKey("related-categories"),
  { tags: [CATEGORIES_TAG], revalidate: 3600 },
);
