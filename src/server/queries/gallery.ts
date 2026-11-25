import "server-only";
import { unstable_cache } from "next/cache";
import { cacheKey } from "@/server/cache-key";
import { db } from "@/server/db";
import { CATEGORIES_TAG } from "./categories";
import { PROJECTS_TAG } from "./home";

export const GALLERY_PAGE_SIZE = 24;

export type LibraryImage = {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  caption: string | null;
  /** Where the photo is used, so visitors can jump to the matching page. */
  source: { label: string; href: string } | null;
};

/**
 * Photo library: every image used in a published category or project gallery,
 * each listed once (newest first) with its first caption and source page.
 */
export const listLibraryImages = unstable_cache(
  async (page: number): Promise<{ items: LibraryImage[]; total: number }> => {
    const where = {
      OR: [
        { categoryGallery: { some: { category: { isPublished: true } } } },
        { projectGallery: { some: { project: { isPublished: true } } } },
      ],
    };
    const [total, rows] = await Promise.all([
      db.image.count({ where }),
      db.image.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: (page - 1) * GALLERY_PAGE_SIZE,
        take: GALLERY_PAGE_SIZE,
        select: {
          id: true,
          url: true,
          alt: true,
          width: true,
          height: true,
          projectGallery: {
            where: { project: { isPublished: true } },
            take: 1,
            select: { caption: true, project: { select: { title: true, slug: true } } },
          },
          categoryGallery: {
            where: { category: { isPublished: true } },
            take: 1,
            select: { caption: true, category: { select: { name: true, slug: true } } },
          },
        },
      }),
    ]);
    const items = rows.map(({ projectGallery, categoryGallery, ...img }) => {
      const fromProject = projectGallery[0];
      const fromCategory = categoryGallery[0];
      const source = fromProject
        ? { label: fromProject.project.title, href: `/cong-trinh/${fromProject.project.slug}/` }
        : fromCategory
          ? { label: fromCategory.category.name, href: `/${fromCategory.category.slug}/` }
          : null;
      return { ...img, caption: fromProject?.caption ?? fromCategory?.caption ?? null, source };
    });
    return { items, total };
  },
  cacheKey("library-images"),
  { tags: [CATEGORIES_TAG, PROJECTS_TAG], revalidate: 3600 },
);
