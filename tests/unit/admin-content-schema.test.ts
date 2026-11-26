import { describe, expect, it } from "vitest";
import { isReservedSlug } from "@/lib/reserved-slugs";
import { dateToVnLocalInput, vnLocalInputToDate } from "@/lib/vn-time";
import { pageInputSchema, postInputSchema, projectInputSchema } from "@/schemas/admin-content";

const seo = { seoTitle: "", seoDescription: "" };

describe("Vietnam datetime-local conversion", () => {
  it("treats typed times as Vietnam time and round-trips", () => {
    const d = vnLocalInputToDate("2026-11-27T09:30");
    expect(d?.toISOString()).toBe("2026-11-27T02:30:00.000Z");
    expect(dateToVnLocalInput(d)).toBe("2026-11-27T09:30");
    expect(vnLocalInputToDate("27/11/2026 9:30")).toBeNull();
    expect(dateToVnLocalInput(null)).toBe("");
  });
});

describe("projectInputSchema", () => {
  const base = {
    id: "",
    title: "Lăng thờ đá Ninh Bình",
    slug: "",
    province: "Ninh Bình",
    categoryId: "",
    summary: "",
    content: "",
    coverImageId: "",
    gallery: "[]",
    completedAt: "2025-06-01",
    isFeatured: true,
    isPublished: true,
    ...seo,
  };
  it("derives slug and parses the completion date", () => {
    const r = projectInputSchema.parse(base);
    expect(r.slug).toBe("lang-tho-da-ninh-binh");
    expect(r.completedAt?.toISOString()).toBe("2025-06-01T00:00:00.000Z");
  });
  it("requires a real province", () => {
    const r = projectInputSchema.safeParse({ ...base, province: "Hà Tây" });
    expect(r.success).toBe(false);
  });
});

describe("postInputSchema", () => {
  const base = {
    id: "",
    title: "Kinh nghiệm chọn đá",
    slug: "",
    excerpt: "",
    content: "",
    coverImageId: "",
    publishedAt: "",
    ...seo,
  };
  it("empty publish date means draft", () => {
    expect(postInputSchema.parse(base).publishedAt).toBeNull();
  });
  it("converts the publish date from Vietnam time", () => {
    expect(
      postInputSchema
        .parse({ ...base, publishedAt: "2026-12-01T08:00" })
        .publishedAt?.toISOString(),
    ).toBe("2026-12-01T01:00:00.000Z");
    expect(postInputSchema.safeParse({ ...base, publishedAt: "mai" }).success).toBe(false);
  });
});

describe("pageInputSchema and reserved slugs", () => {
  it("validates slugs", () => {
    expect(
      pageInputSchema.parse({ id: "", title: "Chính sách bảo hành", slug: "", content: "", ...seo })
        .slug,
    ).toBe("chinh-sach-bao-hanh");
    expect(
      pageInputSchema.safeParse({ id: "", title: "x y", slug: "Có Dấu", content: "", ...seo })
        .success,
    ).toBe(false);
  });
  it("knows the slugs owned by dedicated routes", () => {
    for (const s of ["lien-he", "cong-trinh", "tin-tuc", "admin", "api"])
      expect(isReservedSlug(s)).toBe(true);
    expect(isReservedSlug("gioi-thieu")).toBe(false);
  });
});
