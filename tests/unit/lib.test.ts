import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatPriceRange, formatVndShort } from "@/lib/format-price";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  localBusinessJsonLd,
  serializeJsonLd,
} from "@/lib/jsonld";
import { buildMetadata, truncateDescription } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";
import { slugify } from "@/lib/slugify";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/");
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("slugify", () => {
  it.each([
    ["Mộ Đá Đôi", "mo-da-doi"],
    ["Lăng thờ đá ba mái", "lang-tho-da-ba-mai"],
    ["Nhà thờ họ  bằng   đá!", "nha-tho-ho-bang-da"],
    ["  Đá xanh rêu / granite  ", "da-xanh-reu-granite"],
    ["Tượng Phật Quan Âm 1,8m", "tuong-phat-quan-am-1-8m"],
    ["Ỷ Ứ Ữ ẞ", "y-u-u"],
    ["", ""],
  ])("%s -> %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("handles precomposed and decomposed input identically", () => {
    expect(slugify("Mộ".normalize("NFC"))).toBe(slugify("Mộ".normalize("NFD")));
  });
});

describe("formatPriceRange", () => {
  it("shares the unit when both bounds use it", () => {
    expect(formatPriceRange(20_000_000, 50_000_000)).toBe("20 – 50 triệu");
  });
  it("keeps both units when they differ", () => {
    expect(formatPriceRange(300_000_000, 1_500_000_000)).toBe("300 triệu – 1,5 tỷ");
  });
  it("swaps reversed bounds", () => {
    expect(formatPriceRange(50_000_000, 20_000_000)).toBe("20 – 50 triệu");
  });
  it("handles single bounds and equal bounds", () => {
    expect(formatPriceRange(20_000_000, null)).toBe("Từ 20 triệu");
    expect(formatPriceRange(undefined, 50_000_000)).toBe("Đến 50 triệu");
    expect(formatPriceRange(30_000_000, 30_000_000)).toBe("30 triệu");
  });
  it("falls back to Liên hệ", () => {
    expect(formatPriceRange()).toBe("Liên hệ");
    expect(formatPriceRange(0, 0)).toBe("Liên hệ");
  });
  it("formats small and fractional amounts", () => {
    expect(formatVndShort(2_500_000)).toBe("2,5 triệu");
    expect(formatVndShort(500_000)).toBe("500.000 đ");
    expect(formatVndShort(2_000_000_000)).toBe("2 tỷ");
  });
});

describe("absoluteUrl", () => {
  it("adds origin and trailing slash", () => {
    expect(absoluteUrl("/mo-da-doi")).toBe("https://example.com/mo-da-doi/");
    expect(absoluteUrl("mo-da-doi/")).toBe("https://example.com/mo-da-doi/");
    expect(absoluteUrl()).toBe("https://example.com/");
  });
  it("keeps files, query strings and absolute URLs", () => {
    expect(absoluteUrl("/og.png")).toBe("https://example.com/og.png");
    expect(absoluteUrl("/cong-trinh?tinh=ha-noi")).toBe(
      "https://example.com/cong-trinh/?tinh=ha-noi",
    );
    expect(absoluteUrl("https://cdn.example.com/a.jpg")).toBe("https://cdn.example.com/a.jpg");
  });
});

describe("buildMetadata", () => {
  it("sets canonical, Open Graph and Twitter", () => {
    const meta = buildMetadata({
      title: "Mộ đá đôi",
      description: "Mô tả",
      path: "/mo-da-doi",
      image: { url: "/og.png", width: 1200, height: 630, alt: "Ảnh" },
    });
    expect(meta.alternates?.canonical).toBe("https://example.com/mo-da-doi/");
    expect(meta.openGraph).toMatchObject({
      url: "https://example.com/mo-da-doi/",
      locale: "vi_VN",
      images: [{ url: "https://example.com/og.png", width: 1200 }],
    });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
    expect(meta.robots).toBeUndefined();
  });
  it("supports noindex", () => {
    expect(buildMetadata({ title: "x", path: "/x", noIndex: true }).robots).toEqual({
      index: false,
      follow: false,
    });
  });
  it("truncates long descriptions on a word boundary", () => {
    const text = "đá ".repeat(100);
    const out = truncateDescription(text);
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/\s…$/);
  });
});

describe("JSON-LD", () => {
  it("escapes characters that could break out of <script>", () => {
    const out = serializeJsonLd({ "@type": "Thing", name: "</script><b>&" });
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(JSON.parse(out)).toEqual({ "@type": "Thing", name: "</script><b>&" });
  });
  it("builds a breadcrumb list with absolute URLs", () => {
    const ld = breadcrumbJsonLd([
      { name: "Trang chủ", path: "/" },
      { name: "Mộ đá đôi", path: "/mo-da-doi" },
    ]);
    expect(ld.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://example.com/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Mộ đá đôi",
        item: "https://example.com/mo-da-doi/",
      },
    ]);
  });
  it("builds FAQPage and skips empty FAQs", () => {
    expect(faqJsonLd([])).toBeNull();
    expect(faqJsonLd([{ q: " ", a: "x" }])).toBeNull();
    const ld = faqJsonLd([{ q: "Hỏi?", a: "Đáp." }]);
    expect(ld?.mainEntity).toEqual([
      { "@type": "Question", name: "Hỏi?", acceptedAnswer: { "@type": "Answer", text: "Đáp." } },
    ]);
  });
  it("builds Article and LocalBusiness with only provided fields", () => {
    const article = articleJsonLd({
      title: "Bài",
      path: "/tin-tuc/bai",
      datePublished: new Date("2026-01-10T00:00:00Z"),
      authorName: "A",
      publisherName: "B",
    });
    expect(article).toMatchObject({
      "@type": "Article",
      mainEntityOfPage: "https://example.com/tin-tuc/bai/",
      datePublished: "2026-01-10T00:00:00.000Z",
    });
    expect(article).not.toHaveProperty("image");

    const biz = localBusinessJsonLd({ name: "Xưởng", telephone: "0900000000", sameAs: [""] });
    expect(biz).toMatchObject({ "@type": "LocalBusiness", url: "https://example.com/" });
    expect(biz).not.toHaveProperty("sameAs");
    expect(biz).not.toHaveProperty("address");
  });
});
