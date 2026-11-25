import "server-only";
import { unstable_cache } from "next/cache";
import { cacheKey } from "@/server/cache-key";
import { db } from "@/server/db";
import { parseSiteSettings, type SiteSettings } from "@/schemas/site-settings";

export const SITE_SETTINGS_TAG = "site-settings";
export const BANNERS_TAG = "banners";
const ONE_HOUR = 3600;

// Cache the raw rows only; parsing happens outside the cache so a schema change
// (new keys/defaults) applies immediately instead of serving a stale shape.
const getSiteSettingRows = unstable_cache(
  async () => db.siteSetting.findMany({ select: { key: true, value: true } }),
  cacheKey("site-setting-rows"),
  { tags: [SITE_SETTINGS_TAG], revalidate: ONE_HOUR },
);

export async function getSiteSettings(): Promise<SiteSettings> {
  return parseSiteSettings(await getSiteSettingRows());
}

export type ActiveBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
};

/** The first active banner (lowest order), used for the promo strip. */
export const getActiveBanner = unstable_cache(
  async (): Promise<ActiveBanner | null> =>
    db.banner.findFirst({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true, title: true, subtitle: true, ctaLabel: true, ctaHref: true },
    }),
  cacheKey("active-banner"),
  { tags: [BANNERS_TAG], revalidate: ONE_HOUR },
);
