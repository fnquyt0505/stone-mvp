import { JsonLd } from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import type { SlugPage } from "@/server/queries/slug";
import { Breadcrumb } from "./breadcrumb";
import { formatViDate } from "./cards";

/** Static content page (about, policies) rendered from the Page table. */
export function StaticPageView({ page }: { page: SlugPage }) {
  const crumbs = [
    { name: "Trang chủ", path: "/" },
    { name: page.title, path: `/${page.slug}/` },
  ];
  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 pb-16 md:px-6 md:pb-24">
      <Breadcrumb items={crumbs} />
      <h1 className="mt-4">{page.title}</h1>
      <p className="mt-2 text-small-responsive text-stone-700">
        Cập nhật ngày <time dateTime={page.updatedAt}>{formatViDate(page.updatedAt)}</time>
      </p>
      <RichText doc={page.content} className="mt-8 space-y-4 [&_h2]:mt-10" />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </main>
  );
}
