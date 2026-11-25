import type { Metadata } from "next";
import { absoluteUrl } from "./site-url";

export const DEFAULT_SITE_NAME = "[MẪU] Xưởng đá mỹ nghệ";
const DESCRIPTION_MAX = 160;

export type SeoImage = { url: string; width?: number; height?: number; alt?: string };

export type PageSeoInput = {
  title: string;
  description?: string | null;
  /** Site-relative path, e.g. "/mo-da-doi/". Used for canonical and og:url. */
  path: string;
  /** Absolute or site-relative image for Open Graph. */
  image?: SeoImage | null;
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
  siteName?: string;
};

/** Collapses whitespace and trims to `max` chars, preferring a word boundary. */
export function truncateDescription(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** Builds Next.js metadata with canonical URL and Open Graph/Twitter tags. */
export function buildMetadata(input: PageSeoInput): Metadata {
  const siteName = input.siteName ?? DEFAULT_SITE_NAME;
  const url = absoluteUrl(input.path);
  const description = input.description ? truncateDescription(input.description) : undefined;
  const images = input.image ? [{ ...input.image, url: absoluteUrl(input.image.url) }] : undefined;

  return {
    title: input.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description,
      url,
      siteName,
      locale: "vi_VN",
      type: input.type ?? "website",
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: input.title,
      description,
    },
    ...(input.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
