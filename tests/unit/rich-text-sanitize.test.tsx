import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RichText } from "@/components/rich-text";
import { parseRichTextJson, sanitizeRichText } from "@/lib/rich-text-sanitize";

const doc = (...content: unknown[]) => ({ type: "doc", content });
const p = (...content: unknown[]) => ({ type: "paragraph", content });
const text = (t: string, marks?: unknown[]) => ({
  type: "text",
  text: t,
  ...(marks ? { marks } : {}),
});

describe("sanitizeRichText", () => {
  it("keeps allowed structure untouched", () => {
    const input = doc(
      { type: "heading", attrs: { level: 2 }, content: [text("Tiêu đề")] },
      p(
        text("Đậm", [{ type: "bold" }]),
        text(" link", [{ type: "link", attrs: { href: "/mo-da-doi/" } }]),
      ),
    );
    expect(sanitizeRichText(input)).toEqual(input);
  });

  it("drops unsafe links but keeps their text", () => {
    const out = sanitizeRichText(
      doc(
        p(
          text("x", [{ type: "link", attrs: { href: "javascript:alert(1)" } }]),
          text("y", [{ type: "link", attrs: { href: "//evil.example" } }]),
        ),
      ),
    );
    expect(out).toEqual(doc(p(text("x"), text("y"))));
  });

  it("removes images from foreign sources and keeps ours with size", () => {
    const out = sanitizeRichText(
      doc(
        { type: "image", attrs: { src: "https://evil.example/x.png", alt: "x" } },
        {
          type: "image",
          attrs: {
            src: "/uploads/2026/11/abc-123.jpg",
            alt: "Mộ",
            width: 800,
            height: "600",
            onerror: "x",
          },
        },
      ),
    );
    expect(out).toEqual(
      doc({
        type: "image",
        attrs: { src: "/uploads/2026/11/abc-123.jpg", alt: "Mộ", width: 800, height: 600 },
      }),
    );
  });

  it("unwraps unknown nodes, drops unknown marks and attributes", () => {
    const out = sanitizeRichText(
      doc(
        { type: "codeBlock", content: [text("giữ chữ")] },
        p(text("a", [{ type: "strike" }, { type: "italic" }])),
        { type: "heading", attrs: { level: 1, class: "x" }, content: [text("H")] },
      ),
    );
    expect(out).toEqual(
      doc(text("giữ chữ"), p(text("a", [{ type: "italic" }])), {
        type: "heading",
        attrs: { level: 2 },
        content: [text("H")],
      }),
    );
  });

  it("keeps tables with bounded spans", () => {
    const out = sanitizeRichText(
      doc({
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                attrs: { colspan: 999, rowspan: 2, colwidth: [100] },
                content: [p(text("ô"))],
              },
            ],
          },
        ],
      }),
    );
    expect(out).toEqual(
      doc({
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [
              { type: "tableCell", attrs: { colspan: 1, rowspan: 2 }, content: [p(text("ô"))] },
            ],
          },
        ],
      }),
    );
  });

  it("rejects non-documents and malformed JSON", () => {
    expect(sanitizeRichText({ type: "paragraph" })).toBeNull();
    expect(parseRichTextJson("{bad json")).toBeNull();
    expect(parseRichTextJson("x".repeat(400_000))).toBeNull();
  });
});

describe("RichText rendering of tables and images", () => {
  it("renders tables and only safe images", () => {
    const html = renderToStaticMarkup(
      <RichText
        doc={doc(
          {
            type: "table",
            content: [
              {
                type: "tableRow",
                content: [
                  { type: "tableHeader", content: [p(text("Kích thước"))] },
                  { type: "tableCell", content: [p(text("2,1 m"))] },
                ],
              },
            ],
          },
          {
            type: "image",
            attrs: { src: "/samples/mau-2.jpg", alt: "Mộ đá", width: 1200, height: 900 },
          },
          { type: "image", attrs: { src: "https://evil.example/x.png", alt: "bad" } },
        )}
      />,
    );
    expect(html).toContain("<th");
    expect(html).toContain("Kích thước");
    expect(html).toContain('alt="Mộ đá"');
    expect(html).not.toContain("evil.example");
  });
});
