import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { PostCard } from "@/components/site/cards";
import { Pagination } from "@/components/site/pagination";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { pageCount, parsePageParam } from "@/lib/pagination";
import { buildMetadata } from "@/lib/seo";
import { listPosts, POSTS_PAGE_SIZE } from "@/server/queries/posts";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const TITLE = "Tin tức & kinh nghiệm";
const DESCRIPTION =
  "Kinh nghiệm chọn mẫu lăng mộ đá, kích thước theo thước Lỗ Ban, chất liệu đá và quy trình thi công.";
const CRUMBS = [
  { name: "Trang chủ", path: "/" },
  { name: TITLE, path: "/tin-tuc/" },
];
const hrefFor = (page: number) => (page > 1 ? `/tin-tuc/?trang=${page}` : "/tin-tuc/");

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePageParam((await searchParams).trang);
  return {
    ...buildMetadata({ title: TITLE, description: DESCRIPTION, path: hrefFor(page) }),
    ...(page > 1 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function PostsPage({ searchParams }: Props) {
  let page = parsePageParam((await searchParams).trang);
  let { items, total } = await listPosts(page);
  const pages = pageCount(total, POSTS_PAGE_SIZE);
  if (page > pages) {
    page = pages;
    ({ items, total } = await listPosts(page));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-12 md:px-6 md:pb-20">
      <Breadcrumb items={CRUMBS} />
      <h1 className="mt-4">{TITLE}</h1>
      <p className="mt-4 max-w-prose text-lg text-stone-700">{DESCRIPTION}</p>

      <h2 className="sr-only">Danh sách bài viết</h2>
      {items.length ? (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id}>
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-stone-700">Chưa có bài viết nào.</p>
      )}

      <Pagination page={page} pages={pages} hrefFor={hrefFor} />
      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
    </main>
  );
}
