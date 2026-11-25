import { cn } from "@/lib/utils";

/** Page section with DESIGN.md spacing; `muted` alternates the stone-50 background. */
export function Section({
  id,
  muted = false,
  className,
  children,
  labelledBy,
}: {
  id?: string;
  muted?: boolean;
  className?: string;
  children: React.ReactNode;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("py-12 md:py-20", muted && "bg-stone-50", className)}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">{children}</div>
    </section>
  );
}

/** H2 with the gold ornament line and optional lead paragraph. */
export function SectionHeading({
  id,
  title,
  lead,
  align = "left",
}: {
  id: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("mb-8 md:mb-12", align === "center" && "text-center")}>
      <h2 id={id} className={cn("section-ornament", align === "center" && "after:mx-auto")}>
        {title}
      </h2>
      {lead ? (
        <p className={cn("mt-4 max-w-prose text-stone-700", align === "center" && "mx-auto")}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}
