import { z } from "zod";

export const specSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});
export const faqSchema = z.object({ q: z.string().trim().min(1), a: z.string().trim().min(1) });

export type Spec = z.infer<typeof specSchema>;
export type Faq = z.infer<typeof faqSchema>;

/** Keeps valid items of a stored JSON array and drops malformed ones. */
function parseList<T>(schema: z.ZodType<T>, value: unknown): T[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = schema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export const parseSpecs = (value: unknown): Spec[] => parseList(specSchema, value);
export const parseFaqs = (value: unknown): Faq[] => parseList(faqSchema, value);
