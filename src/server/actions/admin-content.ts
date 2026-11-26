"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { Prisma } from "@prisma/client";
import { isReservedSlug } from "@/lib/reserved-slugs";
import {
  pageFormInput,
  pageInputSchema,
  postFormInput,
  postInputSchema,
  projectFormInput,
  projectInputSchema,
} from "@/schemas/admin-content";
import { CHECK_FIELDS, zodFieldErrors, type SaveResult } from "@/schemas/admin-shared";
import { requireStaff } from "@/server/auth-guard";
import { db } from "@/server/db";
import { PROJECTS_TAG } from "@/server/queries/home";
import { POSTS_TAG } from "@/server/queries/posts";
import { PAGES_TAG } from "@/server/queries/slug";

type DeleteResult = { ok: boolean; message: string };

const fieldFail = (field: string, message: string): SaveResult => ({
  ok: false,
  message: CHECK_FIELDS,
  fieldErrors: { [field]: message },
});

async function imagesExist(ids: (string | undefined | null)[]): Promise<boolean> {
  const unique = [...new Set(ids.filter((i): i is string => Boolean(i)))];
  return (
    !unique.length || (await db.image.count({ where: { id: { in: unique } } })) === unique.length
  );
}

const json = (value: unknown) => (value ?? undefined) as Prisma.InputJsonValue | undefined;

// ---------- Projects ----------

export async function saveProject(formData: FormData): Promise<SaveResult> {
  await requireStaff();
  const parsed = projectInputSchema.safeParse(projectFormInput(formData));
  if (!parsed.success)
    return { ok: false, message: CHECK_FIELDS, fieldErrors: zodFieldErrors(parsed.error) };
  const v = parsed.data;

  const existing = v.id
    ? await db.project.findUnique({ where: { id: v.id }, select: { slug: true } })
    : null;
  if (v.id && !existing) return { ok: false, message: "Không tìm thấy công trình này." };
  if (
    await db.project.findFirst({
      where: { slug: v.slug, NOT: v.id ? { id: v.id } : undefined },
      select: { id: true },
    })
  ) {
    return fieldFail("slug", "Đường dẫn đã dùng cho công trình khác.");
  }
  if (
    v.categoryId &&
    !(await db.category.findUnique({ where: { id: v.categoryId }, select: { id: true } }))
  ) {
    return fieldFail("categoryId", "Loại sản phẩm không còn tồn tại.");
  }
  if (!(await imagesExist([v.coverImageId, ...v.gallery.map((g) => g.imageId)]))) {
    return { ok: false, message: "Có ảnh không còn tồn tại, vui lòng chọn lại." };
  }

  const data = {
    title: v.title,
    slug: v.slug,
    province: v.province,
    categoryId: v.categoryId ?? null,
    summary: v.summary,
    content: json(v.content),
    coverImageId: v.coverImageId ?? null,
    completedAt: v.completedAt,
    isFeatured: v.isFeatured,
    isPublished: v.isPublished,
    seoTitle: v.seoTitle,
    seoDescription: v.seoDescription,
  };
  const saved = await db.$transaction(async (tx) => {
    const project = v.id
      ? await tx.project.update({ where: { id: v.id }, data, select: { id: true, slug: true } })
      : await tx.project.create({ data, select: { id: true, slug: true } });
    await tx.projectImage.deleteMany({ where: { projectId: project.id } });
    if (v.gallery.length) {
      await tx.projectImage.createMany({
        data: v.gallery.map((g, order) => ({
          projectId: project.id,
          imageId: g.imageId,
          caption: g.caption || null,
          order,
        })),
      });
    }
    return project;
  });

  revalidateTag(PROJECTS_TAG);
  revalidatePath("/cong-trinh/");
  revalidatePath(`/cong-trinh/${saved.slug}/`);
  if (existing && existing.slug !== saved.slug) revalidatePath(`/cong-trinh/${existing.slug}/`);
  revalidatePath("/admin/projects");
  return { ok: true, id: saved.id };
}

export async function deleteProject(id: string): Promise<DeleteResult> {
  await requireStaff();
  const project = await db.project.findUnique({
    where: { id },
    select: { slug: true, title: true },
  });
  if (!project) return { ok: false, message: "Không tìm thấy công trình này." };
  await db.project.delete({ where: { id } });
  revalidateTag(PROJECTS_TAG);
  revalidatePath(`/cong-trinh/${project.slug}/`);
  return { ok: true, message: `Đã xóa "${project.title}".` };
}

// ---------- Posts ----------

export async function savePost(formData: FormData): Promise<SaveResult> {
  const session = await requireStaff();
  const parsed = postInputSchema.safeParse(postFormInput(formData));
  if (!parsed.success)
    return { ok: false, message: CHECK_FIELDS, fieldErrors: zodFieldErrors(parsed.error) };
  const v = parsed.data;

  const existing = v.id
    ? await db.post.findUnique({ where: { id: v.id }, select: { slug: true } })
    : null;
  if (v.id && !existing) return { ok: false, message: "Không tìm thấy bài viết này." };
  if (
    await db.post.findFirst({
      where: { slug: v.slug, NOT: v.id ? { id: v.id } : undefined },
      select: { id: true },
    })
  ) {
    return fieldFail("slug", "Đường dẫn đã dùng cho bài viết khác.");
  }
  if (!(await imagesExist([v.coverImageId]))) {
    return { ok: false, message: "Ảnh bìa không còn tồn tại, vui lòng chọn lại." };
  }

  const data = {
    title: v.title,
    slug: v.slug,
    excerpt: v.excerpt,
    content: json(v.content),
    coverImageId: v.coverImageId ?? null,
    publishedAt: v.publishedAt,
    seoTitle: v.seoTitle,
    seoDescription: v.seoDescription,
  };
  const saved = v.id
    ? await db.post.update({ where: { id: v.id }, data, select: { id: true, slug: true } })
    : await db.post.create({
        data: { ...data, authorId: session.user.id },
        select: { id: true, slug: true },
      });

  revalidateTag(POSTS_TAG);
  revalidatePath("/tin-tuc/");
  revalidatePath(`/tin-tuc/${saved.slug}/`);
  if (existing && existing.slug !== saved.slug) revalidatePath(`/tin-tuc/${existing.slug}/`);
  revalidatePath("/admin/posts");
  return { ok: true, id: saved.id };
}

export async function deletePost(id: string): Promise<DeleteResult> {
  await requireStaff();
  const post = await db.post.findUnique({ where: { id }, select: { slug: true, title: true } });
  if (!post) return { ok: false, message: "Không tìm thấy bài viết này." };
  await db.post.delete({ where: { id } });
  revalidateTag(POSTS_TAG);
  revalidatePath(`/tin-tuc/${post.slug}/`);
  return { ok: true, message: `Đã xóa "${post.title}".` };
}

// ---------- Static pages ----------

export async function savePage(formData: FormData): Promise<SaveResult> {
  await requireStaff();
  const parsed = pageInputSchema.safeParse(pageFormInput(formData));
  if (!parsed.success)
    return { ok: false, message: CHECK_FIELDS, fieldErrors: zodFieldErrors(parsed.error) };
  const v = parsed.data;

  const existing = v.id
    ? await db.page.findUnique({ where: { id: v.id }, select: { slug: true } })
    : null;
  if (v.id && !existing) return { ok: false, message: "Không tìm thấy trang này." };
  if (isReservedSlug(v.slug))
    return fieldFail("slug", "Đường dẫn này dành cho trang có sẵn của website.");
  const [samePage, category] = await Promise.all([
    db.page.findFirst({
      where: { slug: v.slug, NOT: v.id ? { id: v.id } : undefined },
      select: { title: true },
    }),
    db.category.findUnique({ where: { slug: v.slug }, select: { name: true } }),
  ]);
  if (samePage) return fieldFail("slug", `Đường dẫn đã dùng cho trang "${samePage.title}".`);
  if (category) return fieldFail("slug", `Đường dẫn đã dùng cho danh mục "${category.name}".`);

  const data = {
    title: v.title,
    slug: v.slug,
    content: json(v.content),
    seoTitle: v.seoTitle,
    seoDescription: v.seoDescription,
  };
  const saved = v.id
    ? await db.page.update({ where: { id: v.id }, data, select: { id: true, slug: true } })
    : await db.page.create({ data, select: { id: true, slug: true } });

  revalidateTag(PAGES_TAG);
  revalidatePath(`/${saved.slug}/`);
  if (existing && existing.slug !== saved.slug) revalidatePath(`/${existing.slug}/`);
  revalidatePath("/admin/pages");
  return { ok: true, id: saved.id };
}

export async function deletePage(id: string): Promise<DeleteResult> {
  await requireStaff();
  const page = await db.page.findUnique({ where: { id }, select: { slug: true, title: true } });
  if (!page) return { ok: false, message: "Không tìm thấy trang này." };
  await db.page.delete({ where: { id } });
  revalidateTag(PAGES_TAG);
  revalidatePath(`/${page.slug}/`);
  return { ok: true, message: `Đã xóa "${page.title}".` };
}
