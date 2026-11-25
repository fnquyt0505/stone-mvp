import { Fragment, type ReactNode } from "react";

/**
 * Renders a Tiptap/ProseMirror JSON document as React elements. Never emits
 * raw HTML, so stored content cannot inject markup or scripts. Unknown node
 * types render their children only. Extended with tables/images in T22.
 */
type Mark = { type: string; attrs?: Record<string, unknown> };
export type RichNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Mark[];
  content?: RichNode[];
};

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#)/i;

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
        if (!SAFE_URL.test(href)) return child;
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
