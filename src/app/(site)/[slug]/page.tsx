import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import { formatPriceRange } from "@/lib/format-price";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
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

  const container = "mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-16";

  if (resolved.kind === "page") {
    const { page } = resolved;
    return (
      <main className={container}>
        <h1>{page.title}</h1>
        <RichText doc={page.content} className="mt-8 max-w-prose space-y-4" />
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Trang chủ", path: "/" },
            { name: page.title, path: `/${page.slug}/` },
          ])}
        />
      </main>
    );
  }

  // Basic category view; the full category template is built in T11.
  const { category } = resolved;
  const crumbs = [
    { name: "Trang chủ", path: "/" },
    ...(category.parent ? [{ name: category.parent.name, path: `/${category.parent.slug}/` }] : []),
    { name: category.name, path: `/${category.slug}/` },
  ];
  return (
    <main className={container}>
      <h1>{category.name}</h1>
      {category.excerpt ? (
        <p className="mt-4 max-w-prose text-stone-700">{category.excerpt}</p>
      ) : null}
      <p className="mt-4 font-semibold text-jade-700">
        Giá tham khảo: {formatPriceRange(category.priceFrom, category.priceTo)}
      </p>
      <RichText doc={category.content} className="mt-8 max-w-prose space-y-4" />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </main>
  );
}
