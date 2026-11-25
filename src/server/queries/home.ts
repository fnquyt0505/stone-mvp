import "server-only";
import { unstable_cache } from "next/cache";
import { cacheKey } from "@/server/cache-key";
import { db } from "@/server/db";
import { CATEGORIES_TAG } from "./categories";

export const PROJECTS_TAG = "projects";
export const TESTIMONIALS_TAG = "testimonials";

export type CardImage = { url: string; alt: string; width: number; height: number };

const imageSelect = { url: true, alt: true, width: true, height: true } as const;

export type HomeCategory = {
  id: string;
  name: string;
  slug: string;
  excerpt: string | null;
  /** Lowest "from" price across the group and its children, in VND. */
  priceFrom: number | null;
  image: CardImage | null;
};

export const getHomeCategories = unstable_cache(
  async (): Promise<HomeCategory[]> => {
    const groups = await db.category.findMany({
      where: { parentId: null, isPublished: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        excerpt: true,
        priceFrom: true,
        coverImage: { select: imageSelect },
        children: { where: { isPublished: true }, select: { priceFrom: true } },
      },
    });
    return groups.map((g) => {
      const prices = [g.priceFrom, ...g.children.map((c) => c.priceFrom)].filter(
        (p): p is number => typeof p === "number" && p > 0,
      );
      return {
        id: g.id,
        name: g.name,
        slug: g.slug,
        excerpt: g.excerpt,
        priceFrom: prices.length ? Math.min(...prices) : null,
        image: g.coverImage,
      };
    });
  },
  cacheKey("home-categories"),
  { tags: [CATEGORIES_TAG], revalidate: 3600 },
);

export type HomeProject = {
  id: string;
  title: string;
  slug: string;
  province: string;
  year: number | null;
  image: CardImage | null;
};

export const getFeaturedProjects = unstable_cache(
  async (limit = 6): Promise<HomeProject[]> => {
    const projects = await db.project.findMany({
      where: { isPublished: true, isFeatured: true },
      orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        province: true,
        completedAt: true,
        coverImage: { select: imageSelect },
      },
    });
    return projects.map(({ completedAt, coverImage, ...p }) => ({
      ...p,
      year: completedAt ? completedAt.getUTCFullYear() : null,
      image: coverImage,
    }));
  },
  cacheKey("featured-projects"),
  { tags: [PROJECTS_TAG], revalidate: 3600 },
);

export type HomeTestimonial = {
  id: string;
  name: string;
  province: string | null;
  content: string;
  rating: number | null;
};

export const getTestimonials = unstable_cache(
  async (limit = 3): Promise<HomeTestimonial[]> =>
    db.testimonial.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: limit,
      select: { id: true, name: true, province: true, content: true, rating: true },
    }),
  cacheKey("testimonials"),
  { tags: [TESTIMONIALS_TAG], revalidate: 3600 },
);
