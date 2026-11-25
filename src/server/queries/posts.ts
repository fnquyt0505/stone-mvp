import "server-only";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { isValidSlug } from "@/lib/slugify";
import { cacheKey } from "@/server/cache-key";
import { db } from "@/server/db";
import type { CardImage } from "./home";

export const POSTS_TAG = "posts";
export const POSTS_PAGE_SIZE = 9;

const imageSelect = { url: true, alt: true, width: true, height: true } as const;

/** Only posts with a publish date in the past are public. */
const publishedWhere = (): Prisma.PostWhereInput => ({ publishedAt: { lte: new Date() } });

export type PostCardData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  /** ISO string: unstable_cache serializes results as JSON. */
  publishedAt: string;
  image: CardImage | null;
};

export const listPosts = unstable_cache(
  async (page: number): Promise<{ items: PostCardData[]; total: number }> => {
    const where = publishedWhere();
    const [total, rows] = await Promise.all([
      db.post.count({ where }),
      db.post.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * POSTS_PAGE_SIZE,
        take: POSTS_PAGE_SIZE,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
          coverImage: { select: imageSelect },
        },
      }),
    ]);
    const items = rows.map(({ coverImage, publishedAt, ...p }) => ({
      ...p,
      publishedAt: (publishedAt ?? new Date(0)).toISOString(),
      image: coverImage,
    }));
    return { items, total };
  },
  cacheKey("list-posts"),
  // Short revalidate so scheduled posts appear without an admin save.
  { tags: [POSTS_TAG], revalidate: 600 },
);

const postSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  publishedAt: true,
  updatedAt: true,
  seoTitle: true,
  seoDescription: true,
  coverImage: { select: imageSelect },
  author: { select: { name: true } },
} satisfies Prisma.PostSelect;

type PostRow = Prisma.PostGetPayload<{ select: typeof postSelect }>;
export type PostDetail = Omit<PostRow, "publishedAt" | "updatedAt"> & {
  publishedAt: string;
  updatedAt: string;
};

export const getPostBySlug = unstable_cache(
  async (slug: string): Promise<PostDetail | null> => {
    if (!isValidSlug(slug)) return null;
    const p = await db.post.findFirst({ where: { slug, ...publishedWhere() }, select: postSelect });
    if (!p?.publishedAt) return null;
    return { ...p, publishedAt: p.publishedAt.toISOString(), updatedAt: p.updatedAt.toISOString() };
  },
  cacheKey("post-by-slug"),
  { tags: [POSTS_TAG], revalidate: 600 },
);

/** Most recent other posts for the "related" list under an article. */
export const getRecentPosts = unstable_cache(
  async (excludeId: string, limit = 3): Promise<PostCardData[]> => {
    const rows = await db.post.findMany({
      where: { ...publishedWhere(), id: { not: excludeId } },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        coverImage: { select: imageSelect },
      },
    });
    return rows.map(({ coverImage, publishedAt, ...p }) => ({
      ...p,
      publishedAt: (publishedAt ?? new Date(0)).toISOString(),
      image: coverImage,
    }));
  },
  cacheKey("recent-posts"),
  { tags: [POSTS_TAG], revalidate: 600 },
);

export async function getAllPostSlugs(): Promise<string[]> {
  const rows = await db.post.findMany({ where: publishedWhere(), select: { slug: true } });
  return rows.map((r) => r.slug);
}
