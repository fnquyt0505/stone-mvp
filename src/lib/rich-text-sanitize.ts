/**
 * Whitelist-based cleaner for Tiptap/ProseMirror JSON stored from the admin.
 * Unknown nodes are unwrapped (their children kept), unknown marks/attributes
 * dropped, unsafe links removed and images limited to our own sources.
 */
export type RichNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: RichNode[];
};

const BLOCKS = new Set([
  "doc",
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "hardBreak",
  "horizontalRule",
  "table",
  "tableRow",
  "tableHeader",
  "tableCell",
  "image",
  "text",
]);
const MARKS = new Set(["bold", "italic", "underline", "link"]);
const MAX_DEPTH = 20;
const MAX_TEXT = 20_000;

export const SAFE_LINK = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;
export const SAFE_IMAGE_SRC =
  /^(https:\/\/res\.cloudinary\.com\/[^\s"'<>]+|\/uploads\/\d{4}\/\d{2}\/[a-f0-9-]+\.(jpg|png|webp|avif)|\/samples\/[a-z0-9-]+\.(jpg|png|webp))$/i;

function int(value: unknown, min: number, max: number): number | undefined {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
}

function cleanAttrs(type: string, attrs: Record<string, unknown> = {}) {
  switch (type) {
    case "heading":
      return { level: int(attrs.level, 2, 4) ?? 2 };
    case "orderedList":
      return { start: int(attrs.start, 1, 10_000) ?? 1 };
    case "tableCell":
    case "tableHeader":
      return {
        colspan: int(attrs.colspan, 1, 20) ?? 1,
        rowspan: int(attrs.rowspan, 1, 50) ?? 1,
      };
    case "image": {
      const src = typeof attrs.src === "string" ? attrs.src.trim() : "";
      if (!SAFE_IMAGE_SRC.test(src)) return null;
      return {
        src,
        alt: typeof attrs.alt === "string" ? attrs.alt.slice(0, 200) : "",
        width: int(attrs.width, 1, 20_000),
        height: int(attrs.height, 1, 20_000),
      };
    }
    default:
      return undefined;
  }
}

function cleanMarks(marks: unknown): RichNode["marks"] {
  if (!Array.isArray(marks)) return undefined;
  const out: NonNullable<RichNode["marks"]> = [];
  for (const m of marks) {
    if (!m || typeof m !== "object" || !MARKS.has((m as { type: string }).type)) continue;
    const type = (m as { type: string }).type;
    if (type === "link") {
      const href = String((m as { attrs?: { href?: unknown } }).attrs?.href ?? "").trim();
      if (SAFE_LINK.test(href)) out.push({ type, attrs: { href: href.slice(0, 500) } });
    } else {
      out.push({ type });
    }
  }
  return out.length ? out : undefined;
}

function cleanNode(node: unknown, depth: number): RichNode[] {
  if (!node || typeof node !== "object" || depth > MAX_DEPTH) return [];
  const n = node as Partial<RichNode>;
  const type = typeof n.type === "string" ? n.type : "";
  const children = Array.isArray(n.content)
    ? n.content.flatMap((c) => cleanNode(c, depth + 1))
    : [];

  if (!BLOCKS.has(type)) return children; // unwrap unknown wrappers
  if (type === "text") {
    const text = typeof n.text === "string" ? n.text.slice(0, MAX_TEXT) : "";
    if (!text) return [];
    const marks = cleanMarks(n.marks);
    return [{ type, text, ...(marks ? { marks } : {}) }];
  }
  const attrs = cleanAttrs(type, n.attrs);
  if (attrs === null) return []; // e.g. image from a foreign source
  return [
    {
      type,
      ...(attrs ? { attrs } : {}),
      ...(children.length ? { content: children } : {}),
    },
  ];
}

/** Returns a cleaned document, or null when the input is not a Tiptap doc. */
export function sanitizeRichText(input: unknown): RichNode | null {
  if (!input || typeof input !== "object" || (input as RichNode).type !== "doc") return null;
  const [doc] = cleanNode(input, 0);
  return doc ?? null;
}

/** Parses the editor's hidden-input JSON; invalid or oversized input becomes null. */
export function parseRichTextJson(raw: unknown, maxBytes = 300_000): RichNode | null {
  if (typeof raw !== "string" || !raw || raw.length > maxBytes) return null;
  try {
    return sanitizeRichText(JSON.parse(raw));
  } catch {
    return null;
  }
}
