import { cn } from "@/lib/utils";

export const INPUT = "h-11 w-full rounded-md border border-stone-500 bg-white px-3";
export const TEXTAREA = "w-full rounded-md border border-stone-500 bg-white p-3";

/** Label + control + hint/error, wired with aria-describedby. */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: {
    id: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }) => React.ReactNode;
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <label htmlFor={id} className="font-semibold">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {hint ? (
        <p id={`${id}-hint`} className="text-small-responsive text-stone-700">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="font-semibold text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-4 rounded-lg border bg-white p-5">
      <legend className="px-1 font-heading text-lg font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}
