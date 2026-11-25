import { JsonLd } from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import { breadcrumbJsonLd, faqJsonLd, type BreadcrumbItem } from "@/lib/jsonld";
import { parseFaqs, parseSpecs } from "@/schemas/category";
import type { SiteSettings } from "@/schemas/site-settings";
import type { HomeCategory } from "@/server/queries/home";
import type { SlugCategory } from "@/server/queries/slug";
import { Breadcrumb } from "./breadcrumb";
import { CategoryCard } from "./cards";
import { AuthorBox, FaqList, PriceRange, SpecTable } from "./category-blocks";
import { Gallery } from "./gallery";
import { QuoteCategory } from "./quote-context";
import { QuoteSection } from "./quote-section";
import { Section, SectionHeading } from "./section";

/**
 * The category ("product") page: breadcrumb, H1, price range, long-form
 * content, specs, gallery, FAQ, related categories, author, quote CTA.
 */
export function CategoryView({
  category,
  related,
  settings,
}: {
  category: SlugCategory;
  related: HomeCategory[];
  settings: SiteSettings;
}) {
  const specs = parseSpecs(category.specs);
  const faqs = parseFaqs(category.faqs);
  const gallery = category.gallery.map((g) => ({ ...g.image, caption: g.caption }));
  const crumbs: BreadcrumbItem[] = [
    { name: "Trang chủ", path: "/" },
    ...(category.parent ? [{ name: category.parent.name, path: `/${category.parent.slug}/` }] : []),
    { name: category.name, path: `/${category.slug}/` },
  ];

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 md:px-6 md:pb-16">
        <Breadcrumb items={crumbs} />
        <h1 className="mt-4">{category.name}</h1>
        {category.excerpt ? (
          <p className="mt-4 max-w-prose text-lg text-stone-700">{category.excerpt}</p>
        ) : null}
        <div className="mt-6">
          <PriceRange
            from={category.priceFrom}
            to={category.priceTo}
            hotline={settings.hotline}
            zalo={settings.zalo}
          />
        </div>

        <div className="mt-10 grid gap-12">
          <RichText doc={category.content} />

          {specs.length ? (
            <section aria-labelledby="cat-specs">
              <SectionHeading id="cat-specs" title={`Thông số ${category.name.toLowerCase()}`} />
              <SpecTable specs={specs} caption={`Thông số ${category.name}`} />
            </section>
          ) : null}

          {gallery.length ? (
            <section aria-labelledby="cat-gallery">
              <SectionHeading id="cat-gallery" title={`Hình ảnh ${category.name.toLowerCase()}`} />
              <Gallery items={gallery} title={category.name} />
            </section>
          ) : null}

          {faqs.length ? (
            <section aria-labelledby="cat-faq">
              <SectionHeading id="cat-faq" title="Câu hỏi thường gặp" />
              <FaqList faqs={faqs} />
            </section>
          ) : null}

          {settings.author ? (
            <AuthorBox author={settings.author} updatedAt={category.updatedAt} />
          ) : null}
        </div>
      </div>

      {related.length ? (
        <Section muted labelledBy="cat-related">
          <SectionHeading
            id="cat-related"
            title={
              category.parent
                ? `Mẫu khác trong ${category.parent.name.toLowerCase()}`
                : "Các dòng sản phẩm"
            }
          />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <li key={c.id}>
                <CategoryCard category={c} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <QuoteSection defaultCategoryId={category.id} idPrefix="category-quote" />
      <QuoteCategory id={category.id} />

      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)].filter((d) => d !== null)} />
    </main>
  );
}
