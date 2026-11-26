import "server-only";
import { db } from "@/server/db";

/** Admin-side reads for projects, posts and pages (not cached; drafts included). */
const CUID = /^[a-z0-9]{20,40}$/;
const imageSelect = { id: true, url: true, alt: true, width: true, height: true } as const;

export async function listAdminProjects() {
  return db.project.findMany({
    orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      province: true,
      completedAt: true,
      isFeatured: true,
      isPublished: true,
      category: { select: { name: true } },
    },
  });
}

export async function getAdminProject(id: string) {
  if (!CUID.test(id)) return null;
  return db.project.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      province: true,
      categoryId: true,
      summary: true,
      content: true,
      completedAt: true,
      isFeatured: true,
      isPublished: true,
      seoTitle: true,
      seoDescription: true,
      coverImage: { select: imageSelect },
      gallery: {
        orderBy: { order: "asc" },
        select: { caption: true, image: { select: imageSelect } },
      },
    },
  });
}

/** Category choices for projects, grouped like the site menu. */
export async function listCategoryChoices() {
  return db.category.findMany({
    where: { parentId: null },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      children: { orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true } },
    },
  });
}

export async function listAdminPosts() {
  return db.post.findMany({
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

export async function getAdminPost(id: string) {
  if (!CUID.test(id)) return null;
  return db.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      publishedAt: true,
      seoTitle: true,
      seoDescription: true,
      coverImage: { select: imageSelect },
    },
  });
}

export async function listAdminPages() {
  return db.page.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, slug: true, updatedAt: true },
  });
}

export async function getAdminPage(id: string) {
  if (!CUID.test(id)) return null;
  return db.page.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      seoTitle: true,
      seoDescription: true,
    },
  });
}

export type AdminProject = NonNullable<Awaited<ReturnType<typeof getAdminProject>>>;
export type AdminPost = NonNullable<Awaited<ReturnType<typeof getAdminPost>>>;
export type AdminPage = NonNullable<Awaited<ReturnType<typeof getAdminPage>>>;
export type CategoryChoice = Awaited<ReturnType<typeof listCategoryChoices>>[number];
