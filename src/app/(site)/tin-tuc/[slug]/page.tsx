import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { formatViDate, PostCard } from "@/components/site/cards";
import { ImageFrame } from "@/components/site/image-frame";
import { QuoteCta } from "@/components/site/quote-cta";
import { Section, SectionHeading } from "@/components/site/section";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { getAllPostSlugs, getPostBySlug, getRecentPosts } from "@/server/queries/posts";
import { getSiteSettings } from "@/server/queries/site";

export const revalidate = 600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllPostSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Không tìm thấy bài viết", robots: { index: false } };
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/tin-tuc/${post.slug}/`,
    image: post.coverImage,
    type: "article",
    publishedTime: post.publishedAt,
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSiteSettings()]);
  if (!post) notFound();
  const recent = await getRecentPosts(post.id, 3);

  const path = `/tin-tuc/${post.slug}/`;
  const crumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Tin tức", path: "/tin-tuc/" },
    { name: post.title, path },
  ];

  return (
    <main>
      <article className="mx-auto max-w-3xl px-4 pt-6 pb-12 md:px-6 md:pb-16">
        <Breadcrumb items={crumbs} />
        <h1 className="mt-4">{post.title}</h1>
        <p className="mt-3 text-stone-700">
          <time dateTime={post.publishedAt}>{formatViDate(post.publishedAt)}</time>
          {" · "}
          {post.author.name}
        </p>
        {post.excerpt ? <p className="mt-6 text-lg text-stone-900">{post.excerpt}</p> : null}
        <ImageFrame
          image={post.coverImage}
          ratio="aspect-[3/2]"
          sizes="(min-width: 768px) 720px, 100vw"
          priority
          className="mt-8 rounded-lg"
        />
        <RichText doc={post.content} className="mt-8 space-y-4 [&_h2]:mt-8 [&_h3]:mt-6" />
      </article>

      {recent.length ? (
        <Section muted labelledBy="post-recent">
          <SectionHeading id="post-recent" title="Bài viết khác" />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((p) => (
              <li key={p.id}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <QuoteCta hotline={settings.hotline} zalo={settings.zalo} />
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          articleJsonLd({
            title: post.title,
            path,
            description: post.seoDescription || post.excerpt,
            image: post.coverImage?.url,
            datePublished: new Date(post.publishedAt),
            dateModified: new Date(post.updatedAt),
            authorName: post.author.name,
            publisherName: settings.brandName,
          }),
        ]}
      />
    </main>
  );
}
