import "server-only";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { isValidSlug } from "@/lib/slugify";
import { cacheKey } from "@/server/cache-key";
import { db } from "@/server/db";
import { CATEGORIES_TAG } from "./categories";

export const PAGES_TAG = "pages";

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  excerpt: true,
  priceFrom: true,
  priceTo: true,
  content: true,
  specs: true,
  faqs: true,
  seoTitle: true,
  seoDescription: true,
  updatedAt: true,
  parentId: true,
  parent: { select: { name: true, slug: true } },
  coverImage: { select: { url: true, alt: true, width: true, height: true } },
  gallery: {
    orderBy: { order: "asc" },
    select: {
      caption: true,
      image: { select: { id: true, url: true, alt: true, width: true, height: true } },
    },
  },
} satisfies Prisma.CategorySelect;

const pageSelect = {
  id: true,
  slug: true,
  title: true,
  content: true,
  seoTitle: true,
  seoDescription: true,
  updatedAt: true,
} satisfies Prisma.PageSelect;

// unstable_cache serializes results as JSON, so dates are exposed as ISO strings.
type WithIsoDate<T> = Omit<T, "updatedAt"> & { updatedAt: string };
export type SlugCategory = WithIsoDate<
  Prisma.CategoryGetPayload<{ select: typeof categorySelect }>
>;
export type SlugPage = WithIsoDate<Prisma.PageGetPayload<{ select: typeof pageSelect }>>;

export type ResolvedSlug =
  { kind: "category"; category: SlugCategory } | { kind: "page"; page: SlugPage } | null;

/**
 * `/[slug]` is shared by Category and Page (slugs are unique across both,
 * enforced when saving). Published categories win if a clash ever slips in.
 */
export const resolveSlug = unstable_cache(
  async (slug: string): Promise<ResolvedSlug> => {
    if (!isValidSlug(slug)) return null;
    const category = await db.category.findFirst({
      where: { slug, isPublished: true },
      select: categorySelect,
    });
    if (category) {
      return {
        kind: "category",
        category: { ...category, updatedAt: category.updatedAt.toISOString() },
      };
    }
    const page = await db.page.findUnique({ where: { slug }, select: pageSelect });
    return page
      ? { kind: "page", page: { ...page, updatedAt: page.updatedAt.toISOString() } }
      : null;
  },
  cacheKey("resolve-slug"),
  { tags: [CATEGORIES_TAG, PAGES_TAG], revalidate: 3600 },
);

/** All slugs to prerender at build time. */
export async function getAllSlugs(): Promise<string[]> {
  const [categories, pages] = await Promise.all([
    db.category.findMany({ where: { isPublished: true }, select: { slug: true } }),
    db.page.findMany({ select: { slug: true } }),
  ]);
  return [...new Set([...categories, ...pages].map((x) => x.slug))];
}
