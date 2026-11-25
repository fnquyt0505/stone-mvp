/**
 * Idempotent development seed: every record is upserted by a stable key, so
 * `pnpm db:seed` can run repeatedly. It never deletes data.
 *
 * Admin credentials come from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (.env).
 * An existing admin's password is never overwritten.
 */
import { PrismaClient, Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  CATEGORY_GROUPS,
  POSTS,
  PROJECTS,
  SAMPLE,
  SITE_SETTINGS,
  TESTIMONIALS,
  type SeedCategory,
} from "./seed-data";

const prisma = new PrismaClient();
const BCRYPT_COST = 12;

/** Minimal Tiptap document with sample paragraphs. */
function doc(...paragraphs: string[]): Prisma.InputJsonValue {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text: `${SAMPLE} ${text}` }],
    })),
  };
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (>= 12 characters) in .env before seeding.",
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      email,
      name: `${SAMPLE} Quản trị viên`,
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash(password, BCRYPT_COST),
    },
  });
}

/** Placeholder images generated into public/samples (labelled "[MẪU]" on the image). */
const SAMPLE_IMAGE_COUNT = 8;

async function seedImages(): Promise<string[]> {
  const ids: string[] = [];
  for (let n = 1; n <= SAMPLE_IMAGE_COUNT; n++) {
    const publicId = `sample/mau-${n}`;
    const data = {
      url: `/samples/mau-${n}.jpg`,
      alt: `${SAMPLE} Ảnh minh họa công trình đá số ${n}`,
      width: n === 1 ? 1600 : 1200,
      height: 900,
    };
    const image = await prisma.image.upsert({
      where: { publicId },
      create: { publicId, ...data },
      update: data,
    });
    ids.push(image.id);
  }
  return ids;
}

/** Picks a sample image id deterministically (skips #1, reserved for the hero). */
const pick = (ids: string[], i: number) => ids[1 + (i % (ids.length - 1))] ?? null;

function categoryFields(c: SeedCategory, order: number) {
  return {
    name: c.name,
    excerpt: c.excerpt,
    priceFrom: c.priceFrom ?? null,
    priceTo: c.priceTo ?? null,
    specs: c.specs ?? [],
    faqs: c.faqs ?? [],
    content: doc(
      `Bài giới thiệu chi tiết về ${c.name.toLowerCase()} sẽ được biên tập trong trang quản trị.`,
      "Nội dung gồm: đặc điểm, chất liệu, kích thước theo thước Lỗ Ban, quy trình thi công.",
    ),
    seoTitle: `${SAMPLE} ${c.name}`,
    seoDescription: c.excerpt,
    order,
    isPublished: true,
  };
}

async function seedCategories(imageIds: string[]) {
  const idBySlug = new Map<string, string>();
  let imageCursor = 0;

  for (const [groupIndex, group] of CATEGORY_GROUPS.entries()) {
    const groupData = {
      ...categoryFields(group, groupIndex),
      menuGroup: group.menuGroup,
      parentId: null,
      coverImageId: pick(imageIds, imageCursor++),
    };
    const parent = await prisma.category.upsert({
      where: { slug: group.slug },
      create: { slug: group.slug, ...groupData },
      update: groupData,
    });
    idBySlug.set(parent.slug, parent.id);

    for (const [childIndex, c] of group.children.entries()) {
      const childData = {
        ...categoryFields(c, childIndex),
        parentId: parent.id,
        coverImageId: pick(imageIds, imageCursor++),
      };
      const created = await prisma.category.upsert({
        where: { slug: c.slug },
        create: { slug: c.slug, ...childData },
        update: childData,
      });
      idBySlug.set(created.slug, created.id);

      // Gallery: every sample image except the hero, with a sample caption.
      for (const [order, imageId] of imageIds.slice(1).entries()) {
        const galleryData = { caption: `${SAMPLE} ${c.name} — ảnh ${order + 1}`, order };
        await prisma.categoryImage.upsert({
          where: { categoryId_imageId: { categoryId: created.id, imageId } },
          create: { categoryId: created.id, imageId, ...galleryData },
          update: galleryData,
        });
      }
    }
  }

  return idBySlug;
}

async function seedProjects(categoryIds: Map<string, string>, imageIds: string[]) {
  for (const [i, p] of PROJECTS.entries()) {
    const data = {
      title: `${SAMPLE} ${p.title} tại ${p.province}`,
      province: p.province,
      categoryId: categoryIds.get(p.categorySlug) ?? null,
      summary: `${SAMPLE} Công trình minh họa, chưa phải dự án thật.`,
      content: doc("Mô tả công trình, hạng mục thi công và hình ảnh nghiệm thu."),
      completedAt: new Date(Date.UTC(2025, i, 1)),
      isFeatured: p.featured,
      isPublished: true,
      coverImageId: pick(imageIds, i + 3),
      seoTitle: `${SAMPLE} ${p.title} tại ${p.province}`,
    };
    await prisma.project.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...data },
      update: data,
    });
  }
}

async function seedTestimonials() {
  for (const [order, t] of TESTIMONIALS.entries()) {
    const data = {
      name: `${SAMPLE} ${t.name}`,
      province: t.province,
      content: `${SAMPLE} Nội dung đánh giá minh họa, sẽ thay bằng đánh giá thật của khách hàng.`,
      rating: null,
      order,
      isPublished: true,
    };
    await prisma.testimonial.upsert({
      where: { id: t.id },
      create: { id: t.id, ...data },
      update: data,
    });
  }
}

async function seedPosts(authorId: string) {
  for (const [i, p] of POSTS.entries()) {
    const data = {
      title: `${SAMPLE} ${p.title}`,
      excerpt: `${SAMPLE} Tóm tắt bài viết minh họa.`,
      content: doc("Nội dung bài viết minh họa."),
      authorId,
      publishedAt: new Date(Date.UTC(2026, 0, 10 + i)),
      seoTitle: `${SAMPLE} ${p.title}`,
    };
    await prisma.post.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...data },
      update: data,
    });
  }
}

async function seedBanner() {
  const id = "seed-banner-1";
  const data = {
    title: `${SAMPLE} Tư vấn thiết kế miễn phí`,
    subtitle: `${SAMPLE} Nội dung khuyến mãi sẽ cập nhật trong trang quản trị.`,
    ctaLabel: "Gọi ngay",
    ctaHref: "tel:0900000000",
    isActive: true,
    order: 0,
  };
  await prisma.banner.upsert({ where: { id }, create: { id, ...data }, update: data });
}

async function seedSettings() {
  for (const [key, value] of Object.entries(SITE_SETTINGS)) {
    const json = value as Prisma.InputJsonValue;
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: json },
      update: { value: json },
    });
  }
}

async function main() {
  const admin = await seedAdmin();
  const imageIds = await seedImages();
  const categoryIds = await seedCategories(imageIds);
  await seedProjects(categoryIds, imageIds);
  await seedTestimonials();
  await seedPosts(admin.id);
  await seedBanner();
  await seedSettings();

  const counts = {
    categories: await prisma.category.count(),
    projects: await prisma.project.count(),
    testimonials: await prisma.testimonial.count(),
    posts: await prisma.post.count(),
    banners: await prisma.banner.count(),
    settings: await prisma.siteSetting.count(),
    users: await prisma.user.count(),
    images: await prisma.image.count(),
    galleryItems: await prisma.categoryImage.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
