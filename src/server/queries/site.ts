import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/server/db";
import { parseSiteSettings, type SiteSettings } from "@/schemas/site-settings";

export const SITE_SETTINGS_TAG = "site-settings";
export const BANNERS_TAG = "banners";
const ONE_HOUR = 3600;

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const rows = await db.siteSetting.findMany({ select: { key: true, value: true } });
    return parseSiteSettings(rows);
  },
  ["site-settings"],
  { tags: [SITE_SETTINGS_TAG], revalidate: ONE_HOUR },
);

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
  ["active-banner"],
  { tags: [BANNERS_TAG], revalidate: ONE_HOUR },
);
