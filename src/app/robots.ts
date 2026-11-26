import type { MetadataRoute } from "next";
import { buildRobots } from "@/lib/robots-rules";
import { getSiteUrl } from "@/lib/site-url";
import { getSiteSettings } from "@/server/queries/site";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { isSampleData } = await getSiteSettings();
  return buildRobots(getSiteUrl(), isSampleData);
}
