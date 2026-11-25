import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryCard, ProjectCard, TestimonialCard } from "@/components/site/cards";
import { Hero } from "@/components/site/hero";
import { ProcessSteps } from "@/components/site/process-steps";
import { QuoteCta } from "@/components/site/quote-cta";
import { Section, SectionHeading } from "@/components/site/section";
import { buildMetadata } from "@/lib/seo";
import { getFeaturedProjects, getHomeCategories, getTestimonials } from "@/server/queries/home";
import { getSiteSettings } from "@/server/queries/site";

export const revalidate = 3600;

const HERO_TITLE = "Chế tác lăng mộ đá, nhà thờ họ và tượng đá";
const HERO_LEAD =
  "Thiết kế theo thước Lỗ Ban, chế tác tại xưởng, lắp đặt tận nơi. Xem mẫu thật và nhận báo giá trọn gói trước khi quyết định.";

export async function generateMetadata(): Promise<Metadata> {
  const { brandName } = await getSiteSettings();
  return {
    ...buildMetadata({ title: brandName, description: HERO_LEAD, path: "/", siteName: brandName }),
    // Avoid "Brand | Brand" from the layout's title template.
    title: { absolute: `${brandName} — ${HERO_TITLE}` },
  };
}

export default async function HomePage() {
  const [settings, categories, projects, testimonials] = await Promise.all([
    getSiteSettings(),
    getHomeCategories(),
    getFeaturedProjects(6),
    getTestimonials(3),
  ]);

  return (
    <main>
      <Hero title={HERO_TITLE} lead={HERO_LEAD} hotline={settings.hotline} image={null} />

      <Section labelledBy="home-categories">
        <SectionHeading
          id="home-categories"
          title="Sản phẩm của chúng tôi"
          lead="Chọn nhóm sản phẩm để xem mẫu, bảng thông số và khoảng giá tham khảo."
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li key={c.id}>
              <CategoryCard category={c} />
            </li>
          ))}
        </ul>
      </Section>

      {settings.achievements.length ? (
        <section aria-label="Thành tích" className="bg-stone-900 py-10 text-white md:py-14">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 md:grid-cols-4 md:px-6">
            {settings.achievements.map((a) => (
              <div key={a.label} className="flex flex-col-reverse text-center">
                <dt className="mt-1 text-stone-200">{a.label}</dt>
                <dd className="font-heading text-h2 font-bold text-gold-600 md:text-h2-lg">
                  {a.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {projects.length ? (
        <Section muted labelledBy="home-projects">
          <SectionHeading
            id="home-projects"
            title="Công trình tiêu biểu"
            lead="Một số công trình chúng tôi đã thi công cho các gia đình, dòng họ."
          />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p.id}>
                <ProjectCard project={p} />
              </li>
            ))}
          </ul>
          <p className="mt-8">
            <Link
              href="/cong-trinh/"
              className="inline-flex min-h-11 items-center gap-1 font-semibold text-jade-700 hover:underline"
            >
              Xem tất cả công trình <ArrowRight aria-hidden className="size-4" />
            </Link>
          </p>
        </Section>
      ) : null}

      <Section labelledBy="home-process">
        <SectionHeading
          id="home-process"
          title="Quy trình đặt hàng"
          lead="7 bước rõ ràng từ lúc Quý khách liên hệ đến khi nghiệm thu công trình."
        />
        <ProcessSteps />
        <p className="mt-8">
          <Link
            href="/huong-dan-dat-hang/"
            className="inline-flex min-h-11 items-center gap-1 font-semibold text-jade-700 hover:underline"
          >
            Xem hướng dẫn đặt hàng <ArrowRight aria-hidden className="size-4" />
          </Link>
        </p>
      </Section>

      {testimonials.length ? (
        <Section muted labelledBy="home-testimonials">
          <SectionHeading id="home-testimonials" title="Khách hàng nói về chúng tôi" />
          <ul className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <li key={t.id}>
                <TestimonialCard testimonial={t} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <QuoteCta hotline={settings.hotline} zalo={settings.zalo} />
    </main>
  );
}
