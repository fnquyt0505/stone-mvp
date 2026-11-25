import { serializeJsonLd, type JsonLd as JsonLdData } from "@/lib/jsonld";

/**
 * Renders structured data. Safe to inline: serializeJsonLd escapes every
 * character that could terminate the <script> element.
 */
export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
