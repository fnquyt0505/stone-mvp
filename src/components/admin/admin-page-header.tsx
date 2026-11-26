import Link from "next/link";
import { ArrowLeft, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedNotice } from "./use-admin-form";

/** List page heading with an "add" button and optional "deleted" notice. */
export function ListHeader({
  title,
  newHref,
  newLabel,
  deletedText,
}: {
  title: string;
  newHref: string;
  newLabel: string;
  deletedText?: string | null;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1>{title}</h1>
        <Button asChild size="lg">
          <Link href={newHref}>
            <Plus aria-hidden /> {newLabel}
          </Link>
        </Button>
      </div>
      {deletedText ? <SavedNotice text={deletedText} /> : null}
    </>
  );
}

/** Edit page heading: back link, title, "view on site" link and saved notice. */
export function EditHeader({
  backHref,
  backLabel,
  title,
  viewHref,
  savedText,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  viewHref?: string | null;
  savedText?: string | null;
}) {
  return (
    <>
      <Link
        href={backHref}
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-jade-700 hover:underline"
      >
        <ArrowLeft aria-hidden className="size-4" /> {backLabel}
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>{title}</h1>
        {viewHref ? (
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1 font-semibold text-jade-700 hover:underline"
          >
            Xem trên website <ExternalLink aria-hidden className="size-4" />
          </a>
        ) : null}
      </div>
      {savedText ? <SavedNotice text={savedText} /> : null}
    </>
  );
}

/** Small colored status pill with text (color is never the only signal). */
export function StatusPill({
  tone,
  children,
}: {
  tone: "on" | "off" | "info";
  children: React.ReactNode;
}) {
  const cls =
    tone === "on"
      ? "bg-success text-white"
      : tone === "info"
        ? "bg-gold-600 text-stone-900"
        : "bg-stone-200 text-stone-700";
  return (
    <span className={`rounded-md px-2 py-0.5 text-small font-semibold ${cls}`}>{children}</span>
  );
}
