import { describe, expect, it } from "vitest";
import { CATEGORY_GROUPS, POSTS, PROJECTS, SAMPLE, TESTIMONIALS } from "../../prisma/seed-data";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const categories = CATEGORY_GROUPS.flatMap((g) => [g, ...g.children]);

describe("seed data", () => {
  it("has 6 groups and about 15 child categories", () => {
    expect(CATEGORY_GROUPS).toHaveLength(6);
    expect(categories.length - CATEGORY_GROUPS.length).toBeGreaterThanOrEqual(15);
  });

  it("uses unique, url-safe slugs", () => {
    const slugs = [...categories, ...PROJECTS, ...POSTS].map((x) => x.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(SLUG_RE);
  });

  it("marks sample text with [MẪU]", () => {
    for (const c of categories) expect(c.excerpt).toContain(SAMPLE);
    for (const c of categories) for (const f of c.faqs ?? []) expect(f.a).toContain(SAMPLE);
  });

  it("only references existing categories from projects", () => {
    const slugs = new Set(categories.map((c) => c.slug));
    for (const p of PROJECTS) expect(slugs.has(p.categorySlug)).toBe(true);
  });

  it("has 3 testimonials with stable ids", () => {
    expect(new Set(TESTIMONIALS.map((t) => t.id)).size).toBe(3);
  });

  it("keeps price ranges ordered", () => {
    for (const c of categories) {
      if (c.priceFrom != null && c.priceTo != null)
        expect(c.priceFrom).toBeLessThanOrEqual(c.priceTo);
    }
  });
});
