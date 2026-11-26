import "server-only";
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { db } from "@/server/db";

/** Fixed public routes (paths with trailing slash). */
const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly";
}[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/cong-trinh/", priority: 0.8, changeFrequency: "weekly" },
  { path: "/tin-tuc/", priority: 0.6, changeFrequency: "weekly" },
  { path: "/thu-vien-hinh-anh/", priority: 0.5, changeFrequency: "weekly" },
  { path: "/huong-dan-dat-hang/", priority: 0.5, changeFrequency: "monthly" },
  { path: "/lien-he/", priority: 0.7, changeFrequency: "monthly" },
];

/** Every indexable public URL. Unpublished categories/projects and drafts are excluded. */
export async function getSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const [categories, pages, projects, posts] = await Promise.all([
    db.category.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true, parentId: true },
    }),
    db.page.findMany({ select: { slug: true, updatedAt: true } }),
    db.project.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    db.post.findMany({
      where: { publishedAt: { lte: now } },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    ...STATIC_ROUTES.map((r) => ({
      url: absoluteUrl(r.path),
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    // Category pages are the main "product" pages.
    ...categories.map((c) => ({
      url: absoluteUrl(`/${c.slug}/`),
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: c.parentId ? 0.9 : 0.8,
    })),
    ...projects.map((p) => ({
      url: absoluteUrl(`/cong-trinh/${p.slug}/`),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/tin-tuc/${p.slug}/`),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...pages.map((p) => ({
      url: absoluteUrl(`/${p.slug}/`),
      lastModified: p.updatedAt,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
