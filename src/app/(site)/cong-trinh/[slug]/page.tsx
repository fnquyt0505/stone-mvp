import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Tag } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { Gallery } from "@/components/site/gallery";
import { ImageFrame } from "@/components/site/image-frame";
import { QuoteCta } from "@/components/site/quote-cta";
import { SectionHeading } from "@/components/site/section";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { slugify } from "@/lib/slugify";
import { getAllProjectSlugs, getProjectBySlug } from "@/server/queries/projects";
import { getSiteSettings } from "@/server/queries/site";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllProjectSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Không tìm thấy công trình", robots: { index: false } };
  return buildMetadata({
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.summary,
    path: `/cong-trinh/${project.slug}/`,
    image: project.coverImage,
    type: "article",
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSiteSettings()]);
  if (!project) notFound();

  const crumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Công trình", path: "/cong-trinh/" },
    { name: project.title, path: `/cong-trinh/${project.slug}/` },
  ];
  const year = project.completedAt ? new Date(project.completedAt).getUTCFullYear() : null;
  const gallery = project.gallery.map((g) => ({ ...g.image, caption: g.caption }));

  return (
    <main>
      <article className="mx-auto max-w-7xl px-4 pt-6 pb-12 md:px-6 md:pb-16">
        <Breadcrumb items={crumbs} />
        <h1 className="mt-4">{project.title}</h1>

        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-stone-700">
          <li className="flex items-center gap-2">
            <MapPin aria-hidden className="size-5 text-gold-600" />
            <Link
              href={`/cong-trinh/?tinh=${slugify(project.province)}`}
              className="hover:text-jade-700 hover:underline"
            >
              {project.province}
            </Link>
          </li>
          {year ? (
            <li className="flex items-center gap-2">
              <CalendarDays aria-hidden className="size-5 text-gold-600" />
              Hoàn thành năm {year}
            </li>
          ) : null}
          {project.category ? (
            <li className="flex items-center gap-2">
              <Tag aria-hidden className="size-5 text-gold-600" />
              <Link
                href={`/${project.category.slug}/`}
                className="hover:text-jade-700 hover:underline"
              >
                {project.category.name}
              </Link>
            </li>
          ) : null}
        </ul>

        {project.summary ? (
          <p className="mt-6 max-w-prose text-lg text-stone-700">{project.summary}</p>
        ) : null}

        <ImageFrame
          image={project.coverImage}
          ratio="aspect-[3/2]"
          sizes="(min-width: 1280px) 1232px, 100vw"
          priority
          className="mt-8 rounded-lg"
        />

        <RichText doc={project.content} className="mt-10 max-w-prose space-y-4" />

        {gallery.length ? (
          <section aria-labelledby="project-gallery" className="mt-12">
            <SectionHeading id="project-gallery" title="Hình ảnh công trình" />
            <Gallery items={gallery} title={project.title} />
          </section>
        ) : null}
      </article>

      <QuoteCta hotline={settings.hotline} zalo={settings.zalo} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </main>
  );
}
