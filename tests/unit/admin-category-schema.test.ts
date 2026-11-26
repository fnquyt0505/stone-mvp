import { describe, expect, it } from "vitest";
import { categoryInputSchema } from "@/schemas/admin-category";

const IMG = "clx0000000000000000000001";
const base = {
  id: "",
  name: "Mộ đá tam sơn",
  slug: "",
  parentId: "",
  menuGroup: "",
  excerpt: "",
  priceFrom: "",
  priceTo: "",
  content: "",
  specs: "[]",
  faqs: "[]",
  coverImageId: "",
  gallery: "[]",
  seoTitle: "",
  seoDescription: "",
  order: "3",
  isPublished: true,
};

describe("categoryInputSchema", () => {
  it("derives the slug from the name and converts prices from millions", () => {
    const r = categoryInputSchema.parse({ ...base, priceFrom: "1,5", priceTo: "20" });
    expect(r).toMatchObject({
      slug: "mo-da-tam-son",
      priceFrom: 1_500_000,
      priceTo: 20_000_000,
      order: 3,
    });
    expect(r.parentId).toBeUndefined();
    expect(r.content).toBeNull();
  });

  it("rejects invalid slugs, reversed prices and bad numbers", () => {
    const r = categoryInputSchema.safeParse({
      ...base,
      slug: "Mộ Đá",
      priceFrom: "50",
      priceTo: "20",
    });
    expect(r.success).toBe(false);
    const paths = r.success ? [] : r.error.issues.map((i) => i.path[0]);
    expect(paths).toEqual(expect.arrayContaining(["slug", "priceTo"]));
    expect(categoryInputSchema.safeParse({ ...base, priceFrom: "hai mươi" }).success).toBe(false);
  });

  it("validates specs, FAQs and gallery JSON", () => {
    const ok = categoryInputSchema.parse({
      ...base,
      specs: JSON.stringify([{ label: "Chất liệu", value: "Đá xanh rêu" }]),
      faqs: JSON.stringify([{ q: "Bảo hành?", a: "Có" }]),
      gallery: JSON.stringify([{ imageId: IMG, caption: "Mặt trước" }]),
    });
    expect(ok.gallery).toEqual([{ imageId: IMG, caption: "Mặt trước" }]);

    expect(categoryInputSchema.safeParse({ ...base, specs: "{oops" }).success).toBe(false);
    expect(
      categoryInputSchema.safeParse({ ...base, faqs: JSON.stringify([{ q: "", a: "x" }]) }).success,
    ).toBe(false);
    expect(
      categoryInputSchema.safeParse({
        ...base,
        gallery: JSON.stringify([{ imageId: IMG }, { imageId: IMG }]),
      }).success,
    ).toBe(false);
  });

  it("sanitizes rich text content", () => {
    const content = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "x", marks: [{ type: "link", attrs: { href: "javascript:1" } }] },
          ],
        },
      ],
    });
    expect(categoryInputSchema.parse({ ...base, content }).content).toEqual({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "x" }] }],
    });
  });
});
