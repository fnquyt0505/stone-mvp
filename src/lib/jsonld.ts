import { absoluteUrl } from "./site-url";

/** schema.org node; intentionally loose (string keys, JSON values). */
export type JsonLd = { "@context"?: string; "@type": string; [key: string]: unknown };

const CONTEXT = "https://schema.org";

/**
 * Serializes JSON-LD for a <script type="application/ld+json"> tag. Escapes
 * <, > and & so content can never close the script element.
 */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export type FaqItem = { q: string; a: string };

/** Returns null when there is no usable FAQ, so callers can skip the tag. */
export function faqJsonLd(faqs: FaqItem[]): JsonLd | null {
  const valid = faqs.filter((f) => f.q.trim() && f.a.trim());
  if (valid.length === 0) return null;
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: valid.map((f) => ({
      "@type": "Question",
      name: f.q.trim(),
      acceptedAnswer: { "@type": "Answer", text: f.a.trim() },
    })),
  };
}

export type ArticleInput = {
  title: string;
  path: string;
  description?: string | null;
  image?: string | null;
  datePublished?: Date | null;
  dateModified?: Date | null;
  authorName: string;
  publisherName: string;
  publisherLogo?: string | null;
};

export function articleJsonLd(input: ArticleInput): JsonLd {
  return {
    "@context": CONTEXT,
    "@type": "Article",
    headline: input.title,
    mainEntityOfPage: absoluteUrl(input.path),
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: [absoluteUrl(input.image)] } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished.toISOString() } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified.toISOString() } : {}),
    author: { "@type": "Person", name: input.authorName },
    publisher: {
      "@type": "Organization",
      name: input.publisherName,
      ...(input.publisherLogo
        ? { logo: { "@type": "ImageObject", url: absoluteUrl(input.publisherLogo) } }
        : {}),
    },
  };
}

export type LocalBusinessInput = {
  name: string;
  telephone?: string | null;
  email?: string | null;
  address?: string | null;
  openingHours?: string | null;
  image?: string | null;
  sameAs?: string[];
};

export function localBusinessJsonLd(input: LocalBusinessInput): JsonLd {
  const sameAs = (input.sameAs ?? []).filter(Boolean);
  return {
    "@context": CONTEXT,
    "@type": "LocalBusiness",
    name: input.name,
    url: absoluteUrl("/"),
    ...(input.telephone ? { telephone: input.telephone } : {}),
    ...(input.email ? { email: input.email } : {}),
    ...(input.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: input.address,
            addressCountry: "VN",
          },
        }
      : {}),
    ...(input.openingHours ? { openingHours: input.openingHours } : {}),
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}
