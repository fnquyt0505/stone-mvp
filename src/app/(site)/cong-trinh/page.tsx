import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { ProjectCard } from "@/components/site/cards";
import { Pagination } from "@/components/site/pagination";
import { ProjectFilterForm } from "@/components/site/project-list-controls";
import { QuoteCta } from "@/components/site/quote-cta";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { parseProjectFilter, projectListHref, totalPages } from "@/schemas/project-filter";
import { getProjectFilterOptions, listProjects } from "@/server/queries/projects";
import { getSiteSettings } from "@/server/queries/site";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const TITLE = "Công trình đã thi công";
const DESCRIPTION =
  "Hình ảnh các công trình lăng mộ đá, nhà thờ họ, tượng đá chúng tôi đã thi công. Lọc theo tỉnh thành và loại công trình.";
const CRUMBS = [
  { name: "Trang chủ", path: "/" },
  { name: TITLE, path: "/cong-trinh/" },
];

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filter = parseProjectFilter(await searchParams);
  const isBase = !filter.tinh && !filter.loai && filter.trang === 1;
  return {
    ...buildMetadata({ title: TITLE, description: DESCRIPTION, path: projectListHref(filter) }),
    // Filtered/paginated views stay crawlable but are not indexed as separate pages.
    ...(isBase ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function ProjectsPage({ searchParams }: Props) {
  const filter = parseProjectFilter(await searchParams);
  const [options, settings] = await Promise.all([getProjectFilterOptions(), getSiteSettings()]);

  const province = options.provinces.find((p) => p.slug === filter.tinh);
  const group = options.groups.find((g) => g.slug === filter.loai);
  // Unknown filter values are treated as "no filter" rather than an empty list.
  const effective = { ...filter, tinh: province?.slug, loai: group?.slug };
  const query = { province: province?.name, group: group?.slug };
  let { items, total } = await listProjects({ ...query, page: effective.trang });
  const pages = totalPages(total);
  // Out-of-range page numbers show the last page instead of an empty list.
  if (effective.trang > pages) {
    effective.trang = pages;
    ({ items, total } = await listProjects({ ...query, page: pages }));
  }

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 md:px-6 md:pb-20">
        <Breadcrumb items={CRUMBS} />
        <h1 className="mt-4">{TITLE}</h1>
        <p className="mt-4 max-w-prose text-lg text-stone-700">{DESCRIPTION}</p>

        <div className="mt-8">
          <ProjectFilterForm
            filter={effective}
            provinces={options.provinces}
            groups={options.groups}
          />
        </div>

        <p className="mt-6 text-stone-700" role="status">
          {total
            ? `Có ${total} công trình${province ? ` tại ${province.name}` : ""}${group ? ` thuộc ${group.name.toLowerCase()}` : ""}.`
            : "Chưa có công trình phù hợp. Quý khách thử bỏ bớt bộ lọc."}
        </p>

        {items.length ? (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <li key={p.id}>
                <ProjectCard project={p} />
              </li>
            ))}
          </ul>
        ) : null}

        <Pagination
          page={effective.trang}
          pages={pages}
          hrefFor={(trang) => projectListHref({ ...effective, trang })}
        />
      </div>

      <QuoteCta hotline={settings.hotline} zalo={settings.zalo} />
      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
    </main>
  );
}
