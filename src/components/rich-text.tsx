import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import { SAFE_IMAGE_SRC, SAFE_LINK } from "@/lib/rich-text-sanitize";

/**
 * Renders a Tiptap/ProseMirror JSON document as React elements. Never emits
 * raw HTML, so stored content cannot inject markup or scripts. Unknown node
 * types render their children only. Content is also cleaned on save
 * (lib/rich-text-sanitize.ts); the renderer re-checks links and image sources.
 */
type Mark = { type: string; attrs?: Record<string, unknown> };
export type RichNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Mark[];
  content?: RichNode[];
};

function isNode(value: unknown): value is RichNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function applyMarks(text: string, marks: Mark[] = []): ReactNode {
  return marks.reduce<ReactNode>((child, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{child}</strong>;
      case "italic":
        return <em>{child}</em>;
      case "underline":
        return <u>{child}</u>;
      case "link": {
        const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "";
        if (!SAFE_LINK.test(href)) return child;
        const external = /^https?:/i.test(href);
        return (
          <a
            href={href}
            className="text-jade-700 underline underline-offset-4"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {child}
          </a>
        );
      }
      default:
        return child;
    }
  }, text);
}

function renderChildren(nodes: unknown, keyPrefix: string): ReactNode {
  if (!Array.isArray(nodes)) return null;
  return nodes
    .filter(isNode)
    .map((n, i) => (
      <Fragment key={`${keyPrefix}-${i}`}>{renderNode(n, `${keyPrefix}-${i}`)}</Fragment>
    ));
}

function renderNode(node: RichNode, key: string): ReactNode {
  const children = renderChildren(node.content, key);
  switch (node.type) {
    case "doc":
      return children;
    case "text":
      return applyMarks(node.text ?? "", node.marks);
    case "paragraph":
      return <p>{children}</p>;
    case "heading": {
      // Page owns the h1; content headings start at h2 and never skip levels past h4.
      const level = Math.min(Math.max(Number(node.attrs?.level) || 2, 2), 4);
      if (level === 2) return <h2>{children}</h2>;
      if (level === 3) return <h3>{children}</h3>;
      return <h4>{children}</h4>;
    }
    case "bulletList":
      return <ul className="list-disc pl-6">{children}</ul>;
    case "orderedList":
      return <ol className="list-decimal pl-6">{children}</ol>;
    case "listItem":
      return <li>{children}</li>;
    case "blockquote":
      return <blockquote className="border-l-4 border-gold-600 pl-4 italic">{children}</blockquote>;
    case "hardBreak":
      return <br />;
    case "horizontalRule":
      return <hr className="border-stone-200" />;
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <tbody>{children}</tbody>
          </table>
        </div>
      );
    case "tableRow":
      return <tr className="even:bg-stone-50">{children}</tr>;
    case "tableHeader":
    case "tableCell": {
      const Cell = node.type === "tableHeader" ? "th" : "td";
      const span = (v: unknown) => Math.min(Math.max(Number(v) || 1, 1), 50);
      return (
        <Cell
          colSpan={span(node.attrs?.colspan)}
          rowSpan={span(node.attrs?.rowspan)}
          className="border border-stone-200 p-3 align-top [&>p]:m-0"
        >
          {children}
        </Cell>
      );
    }
    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
      if (!SAFE_IMAGE_SRC.test(src)) return null;
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      return (
        <Image
          src={src}
          alt={alt}
          width={Number(node.attrs?.width) || 1200}
          height={Number(node.attrs?.height) || 800}
          sizes="(min-width: 768px) 720px, 100vw"
          className="h-auto w-full rounded-lg"
        />
      );
    }
    default:
      return children;
  }
}

export function RichText({ doc, className }: { doc: unknown; className?: string }) {
  if (!isNode(doc)) return null;
  return (
    <div className={className ?? "max-w-prose space-y-4 [&_h2]:mt-8 [&_h3]:mt-6"}>
      {renderNode(doc, "n")}
    </div>
  );
}
