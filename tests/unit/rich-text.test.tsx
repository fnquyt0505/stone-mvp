import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RichText } from "@/components/rich-text";
import { isValidSlug } from "@/lib/slugify";

const html = (doc: unknown) => renderToStaticMarkup(<RichText doc={doc} className="x" />);

describe("RichText", () => {
  it("renders paragraphs, headings, lists and marks", () => {
    const out = html({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Tiêu đề" }] },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Đá ", marks: [{ type: "bold" }] },
            { type: "text", text: "xanh", marks: [{ type: "italic" }] },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "A" }] }],
            },
          ],
        },
      ],
    });
    expect(out).toContain("<h2>Tiêu đề</h2>");
    expect(out).toContain("<strong>Đá </strong><em>xanh</em>");
    expect(out).toContain('<ul class="list-disc pl-6"><li><p>A</p></li></ul>');
  });

  it("never renders an h1 and clamps heading levels", () => {
    const out = html({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "a" }] },
        { type: "heading", attrs: { level: 6 }, content: [{ type: "text", text: "b" }] },
      ],
    });
    expect(out).not.toContain("<h1");
    expect(out).toContain("<h2>a</h2>");
    expect(out).toContain("<h4>b</h4>");
  });

  it("escapes text and drops unsafe links", () => {
    const out = html({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "<script>alert(1)</script>" },
            {
              type: "text",
              text: "bad",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
            { type: "text", text: "ok", marks: [{ type: "link", attrs: { href: "/mo-da-doi/" } }] },
          ],
        },
      ],
    });
    expect(out).not.toContain("<script>");
    expect(out).toContain("&lt;script&gt;");
    expect(out).not.toContain("javascript:");
    expect(out).toContain('href="/mo-da-doi/"');
  });

  it("ignores invalid documents", () => {
    expect(html(null)).toBe("");
    expect(html("text")).toBe("");
  });
});

describe("isValidSlug", () => {
  it.each(["mo-da-doi", "lang-tho-da-3-mai", "a1"])("accepts %s", (s) => {
    expect(isValidSlug(s)).toBe(true);
  });
  it.each(["", "Mo-Da", "mo--da", "-mo", "mo-", "mộ-đá", "a/b", "x".repeat(121)])(
    "rejects %s",
    (s) => {
      expect(isValidSlug(s)).toBe(false);
    },
  );
});
