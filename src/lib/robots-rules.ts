import type { MetadataRoute } from "next";

/**
 * robots.txt rules. While the site still runs on sample ("[MẪU]") data the
 * whole site is blocked so placeholder content never gets indexed; turning
 * off "dữ liệu mẫu" in admin settings opens it to search engines.
 */
export function buildRobots(siteUrl: string, isSampleData: boolean): MetadataRoute.Robots {
  if (isSampleData) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/dev/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
