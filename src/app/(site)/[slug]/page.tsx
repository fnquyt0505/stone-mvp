import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/site/category-view";
import { StaticPageView } from "@/components/site/static-page-view";
import { buildMetadata } from "@/lib/seo";
import { getRelatedCategories } from "@/server/queries/related";
import { getSiteSettings } from "@/server/queries/site";
import { getAllSlugs, resolveSlug } from "@/server/queries/slug";

export const revalidate = 3600;
// Slugs created in admin after the build render on first request.
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);
  if (!resolved) return { title: "Không tìm thấy trang", robots: { index: false } };

  const path = `/${slug}/`;
  if (resolved.kind === "category") {
    const c = resolved.category;
    return buildMetadata({
      title: c.seoTitle || c.name,
      description: c.seoDescription || c.excerpt,
      path,
      image: c.coverImage,
    });
  }
  const p = resolved.page;
  return buildMetadata({ title: p.seoTitle || p.title, description: p.seoDescription, path });
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);
  if (!resolved) notFound();

  if (resolved.kind === "page") return <StaticPageView page={resolved.page} />;

  const [related, settings] = await Promise.all([
    getRelatedCategories(resolved.category.id, resolved.category.parentId),
    getSiteSettings(),
  ]);
  return <CategoryView category={resolved.category} related={related} settings={settings} />;
}
