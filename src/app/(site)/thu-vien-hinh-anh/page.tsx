import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { Gallery } from "@/components/site/gallery";
import { Pagination } from "@/components/site/pagination";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { pageCount, parsePageParam } from "@/lib/pagination";
import { buildMetadata } from "@/lib/seo";
import { GALLERY_PAGE_SIZE, listLibraryImages } from "@/server/queries/gallery";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const TITLE = "Thư viện hình ảnh";
const DESCRIPTION =
  "Ảnh thực tế các mẫu lăng mộ đá, nhà thờ họ, tượng đá và công trình đã thi công. Bấm vào ảnh để xem lớn.";
const CRUMBS = [
  { name: "Trang chủ", path: "/" },
  { name: TITLE, path: "/thu-vien-hinh-anh/" },
];
const hrefFor = (page: number) =>
  page > 1 ? `/thu-vien-hinh-anh/?trang=${page}` : "/thu-vien-hinh-anh/";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePageParam((await searchParams).trang);
  return {
    ...buildMetadata({ title: TITLE, description: DESCRIPTION, path: hrefFor(page) }),
    ...(page > 1 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function PhotoLibraryPage({ searchParams }: Props) {
  let page = parsePageParam((await searchParams).trang);
  let { items, total } = await listLibraryImages(page);
  const pages = pageCount(total, GALLERY_PAGE_SIZE);
  if (page > pages) {
    page = pages;
    ({ items, total } = await listLibraryImages(page));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-12 md:px-6 md:pb-20">
      <Breadcrumb items={CRUMBS} />
      <h1 className="mt-4">{TITLE}</h1>
      <p className="mt-4 max-w-prose text-lg text-stone-700">{DESCRIPTION}</p>

      <section aria-label="Ảnh" className="mt-10">
        {items.length ? (
          <Gallery items={items} title={TITLE} />
        ) : (
          <p className="text-stone-700">Ảnh đang được cập nhật.</p>
        )}
      </section>

      <Pagination page={page} pages={pages} hrefFor={hrefFor} />
      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
    </main>
  );
}
