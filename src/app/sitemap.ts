import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/server/queries/sitemap";

// Regenerated hourly; admin saves also revalidate the pages themselves.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapEntries();
}
