import { z } from "zod";
import { isValidSlug } from "@/lib/slugify";

export const PROJECTS_PAGE_SIZE = 9;

const slugParam = z.string().trim().toLowerCase().refine(isValidSlug).optional().catch(undefined);

/**
 * Query string for /cong-trinh/: ?tinh=<province-slug>&loai=<group-slug>&trang=<n>.
 * Invalid values are ignored rather than erroring (users share/edit URLs).
 */
export const projectFilterSchema = z.object({
  tinh: slugParam,
  loai: slugParam,
  trang: z.coerce.number().int().min(1).max(1000).catch(1).default(1),
});

export type ProjectFilter = z.infer<typeof projectFilterSchema>;

type RawSearchParams = Record<string, string | string[] | undefined>;

export function parseProjectFilter(params: RawSearchParams): ProjectFilter {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return projectFilterSchema.parse({
    tinh: first(params.tinh) || undefined,
    loai: first(params.loai) || undefined,
    trang: first(params.trang),
  });
}

/** Builds a /cong-trinh/ URL, dropping defaults so canonical URLs stay clean. */
export function projectListHref(filter: Partial<ProjectFilter>): string {
  const qs = new URLSearchParams();
  if (filter.tinh) qs.set("tinh", filter.tinh);
  if (filter.loai) qs.set("loai", filter.loai);
  if (filter.trang && filter.trang > 1) qs.set("trang", String(filter.trang));
  const query = qs.toString();
  return `/cong-trinh/${query ? `?${query}` : ""}`;
}

export function totalPages(total: number, pageSize = PROJECTS_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
