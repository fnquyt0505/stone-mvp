"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { Prisma } from "@prisma/client";
import {
  categoryFormInput,
  categoryInputSchema,
  type CategoryFieldErrors,
  type SaveCategoryResult,
} from "@/schemas/admin-category";
import { requireStaff } from "@/server/auth-guard";
import { db } from "@/server/db";
import { CATEGORIES_TAG } from "@/server/queries/categories";

function invalidate(...slugs: string[]) {
  revalidateTag(CATEGORIES_TAG);
  for (const slug of slugs) revalidatePath(`/${slug}/`);
  revalidatePath("/admin/categories");
}

/** Creates or updates a category (2 levels max, slug unique across categories + pages). */
export async function saveCategory(formData: FormData): Promise<SaveCategoryResult> {
  await requireStaff();

  const parsed = categoryInputSchema.safeParse(categoryFormInput(formData));
  if (!parsed.success) {
    const fieldErrors: CategoryFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, message: "Vui lòng kiểm tra lại các ô báo lỗi.", fieldErrors };
  }
  const v = parsed.data;
  const fail = (field: string, message: string): SaveCategoryResult => ({
    ok: false,
    message: "Vui lòng kiểm tra lại các ô báo lỗi.",
    fieldErrors: { [field]: message },
  });

  const existing = v.id
    ? await db.category.findUnique({
        where: { id: v.id },
        select: { slug: true, _count: { select: { children: true } } },
      })
    : null;
  if (v.id && !existing) return { ok: false, message: "Không tìm thấy danh mục này." };

  // Slugs are shared by /[slug] for categories and static pages.
  const [slugCategory, slugPage] = await Promise.all([
    db.category.findFirst({
      where: { slug: v.slug, NOT: v.id ? { id: v.id } : undefined },
      select: { name: true },
    }),
    db.page.findUnique({ where: { slug: v.slug }, select: { title: true } }),
  ]);
  if (slugCategory) return fail("slug", `Đường dẫn đã dùng cho danh mục "${slugCategory.name}".`);
  if (slugPage) return fail("slug", `Đường dẫn đã dùng cho trang "${slugPage.title}".`);

  if (v.parentId) {
    if (v.parentId === v.id)
      return fail("parentId", "Danh mục không thể là nhóm cha của chính nó.");
    if (existing && existing._count.children > 0) {
      return fail("parentId", "Danh mục này đang có danh mục con nên phải là nhóm cấp 1.");
    }
    const parent = await db.category.findUnique({
      where: { id: v.parentId },
      select: { parentId: true },
    });
    if (!parent || parent.parentId) return fail("parentId", "Nhóm cha phải là danh mục cấp 1.");
  }

  const imageIds = [
    ...new Set([...v.gallery.map((g) => g.imageId), ...(v.coverImageId ? [v.coverImageId] : [])]),
  ];
  if (
    imageIds.length &&
    (await db.image.count({ where: { id: { in: imageIds } } })) !== imageIds.length
  ) {
    return { ok: false, message: "Có ảnh không còn tồn tại, vui lòng chọn lại." };
  }

  const data = {
    name: v.name,
    slug: v.slug,
    parentId: v.parentId ?? null,
    menuGroup: v.parentId ? null : v.menuGroup,
    excerpt: v.excerpt,
    priceFrom: v.priceFrom,
    priceTo: v.priceTo,
    content: (v.content ?? undefined) as Prisma.InputJsonValue | undefined,
    specs: v.specs,
    faqs: v.faqs,
    coverImageId: v.coverImageId ?? null,
    seoTitle: v.seoTitle,
    seoDescription: v.seoDescription,
    order: v.order,
    isPublished: v.isPublished,
  };

  const saved = await db.$transaction(async (tx) => {
    const category = v.id
      ? await tx.category.update({ where: { id: v.id }, data, select: { id: true, slug: true } })
      : await tx.category.create({ data, select: { id: true, slug: true } });
    await tx.categoryImage.deleteMany({ where: { categoryId: category.id } });
    if (v.gallery.length) {
      await tx.categoryImage.createMany({
        data: v.gallery.map((g, order) => ({
          categoryId: category.id,
          imageId: g.imageId,
          caption: g.caption || null,
          order,
        })),
      });
    }
    return category;
  });

  invalidate(saved.slug, ...(existing && existing.slug !== saved.slug ? [existing.slug] : []));
  return { ok: true, id: saved.id, slug: saved.slug };
}

/** Deletes a category without children. Projects/leads keep their data (category set to null). */
export async function deleteCategory(id: string): Promise<{ ok: boolean; message: string }> {
  await requireStaff();
  const category = await db.category.findUnique({
    where: { id },
    select: { slug: true, name: true, _count: { select: { children: true } } },
  });
  if (!category) return { ok: false, message: "Không tìm thấy danh mục này." };
  if (category._count.children > 0) {
    return { ok: false, message: "Hãy chuyển hoặc xóa các danh mục con trước." };
  }
  await db.category.delete({ where: { id } });
  invalidate(category.slug);
  return { ok: true, message: `Đã xóa "${category.name}".` };
}
