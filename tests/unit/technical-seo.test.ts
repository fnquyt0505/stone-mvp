import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildRobots } from "@/lib/robots-rules";
import { buildMetadata } from "@/lib/seo";

beforeEach(() => vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com"));
afterEach(() => vi.unstubAllEnvs());

describe("buildRobots", () => {
  it("blocks everything while the site uses sample data", () => {
    expect(buildRobots("https://example.com", true)).toEqual({
      rules: [{ userAgent: "*", disallow: "/" }],
    });
  });
  it("allows the site but not admin/api and links the sitemap", () => {
    expect(buildRobots("https://example.com", false)).toEqual({
      rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/dev/"] }],
      sitemap: "https://example.com/sitemap.xml",
      host: "https://example.com",
    });
  });
});

describe("default Open Graph image", () => {
  it("is used when a page has no cover", () => {
    const meta = buildMetadata({ title: "Liên hệ", path: "/lien-he/" });
    expect(meta.openGraph).toMatchObject({
      images: [{ url: "https://example.com/og-default.jpg", width: 1200, height: 630 }],
    });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      images: ["https://example.com/og-default.jpg"],
    });
  });
});
