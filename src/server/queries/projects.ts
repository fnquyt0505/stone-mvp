import "server-only";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { isValidSlug, slugify } from "@/lib/slugify";
import { PROJECTS_PAGE_SIZE } from "@/schemas/project-filter";
import { cacheKey } from "@/server/cache-key";
import { db } from "@/server/db";
import { CATEGORIES_TAG } from "./categories";
import { PROJECTS_TAG, type HomeProject } from "./home";

const imageSelect = { url: true, alt: true, width: true, height: true } as const;

export type FilterOption = { slug: string; name: string };

/** Provinces and category groups that actually have published projects. */
export const getProjectFilterOptions = unstable_cache(
  async (): Promise<{ provinces: FilterOption[]; groups: FilterOption[] }> => {
    const rows = await db.project.findMany({
      where: { isPublished: true },
      select: {
        province: true,
        category: {
          select: { slug: true, name: true, parent: { select: { slug: true, name: true } } },
        },
      },
    });
    const provinces = new Map<string, string>();
    const groups = new Map<string, string>();
    for (const r of rows) {
      provinces.set(slugify(r.province), r.province);
      const group = r.category?.parent ?? r.category;
      if (group) groups.set(group.slug, group.name);
    }
    const sorted = (m: Map<string, string>) =>
      [...m]
        .map(([slug, name]) => ({ slug, name }))
        .sort((a, b) => a.name.localeCompare(b.name, "vi"));
    return { provinces: sorted(provinces), groups: sorted(groups) };
  },
  cacheKey("project-filter-options"),
  { tags: [PROJECTS_TAG, CATEGORIES_TAG], revalidate: 3600 },
);

export type ProjectListResult = { items: HomeProject[]; total: number };

export const listProjects = unstable_cache(
  async (args: { province?: string; group?: string; page: number }): Promise<ProjectListResult> => {
    const where: Prisma.ProjectWhereInput = {
      isPublished: true,
      ...(args.province ? { province: args.province } : {}),
      ...(args.group
        ? { category: { OR: [{ slug: args.group }, { parent: { slug: args.group } }] } }
        : {}),
    };
    const [total, rows] = await Promise.all([
      db.project.count({ where }),
      db.project.findMany({
        where,
        orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
        skip: (args.page - 1) * PROJECTS_PAGE_SIZE,
        take: PROJECTS_PAGE_SIZE,
        select: {
          id: true,
          title: true,
          slug: true,
          province: true,
          completedAt: true,
          coverImage: { select: imageSelect },
        },
      }),
    ]);
    const items = rows.map(({ completedAt, coverImage, ...p }) => ({
      ...p,
      year: completedAt ? completedAt.getUTCFullYear() : null,
      image: coverImage,
    }));
    return { items, total };
  },
  cacheKey("list-projects"),
  { tags: [PROJECTS_TAG], revalidate: 3600 },
);

const projectDetailSelect = {
  id: true,
  title: true,
  slug: true,
  province: true,
  summary: true,
  content: true,
  completedAt: true,
  seoTitle: true,
  seoDescription: true,
  coverImage: { select: imageSelect },
  category: { select: { name: true, slug: true } },
  gallery: {
    orderBy: { order: "asc" },
    select: { caption: true, image: { select: { id: true, ...imageSelect } } },
  },
} satisfies Prisma.ProjectSelect;

type ProjectRow = Prisma.ProjectGetPayload<{ select: typeof projectDetailSelect }>;
/** Dates are ISO strings because unstable_cache serializes results as JSON. */
export type ProjectDetail = Omit<ProjectRow, "completedAt"> & { completedAt: string | null };

export const getProjectBySlug = unstable_cache(
  async (slug: string): Promise<ProjectDetail | null> => {
    if (!isValidSlug(slug)) return null;
    const p = await db.project.findFirst({
      where: { slug, isPublished: true },
      select: projectDetailSelect,
    });
    return p ? { ...p, completedAt: p.completedAt?.toISOString() ?? null } : null;
  },
  cacheKey("project-by-slug"),
  { tags: [PROJECTS_TAG], revalidate: 3600 },
);

export async function getAllProjectSlugs(): Promise<string[]> {
  const rows = await db.project.findMany({ where: { isPublished: true }, select: { slug: true } });
  return rows.map((r) => r.slug);
}
