import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { FloatingContact, StickyBottomBar } from "@/components/site/contact-actions";
import { PromoBanner } from "@/components/site/promo-banner";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { QuoteDialog } from "@/components/site/quote-dialog";
import { TopBar } from "@/components/site/top-bar";
import { localBusinessJsonLd } from "@/lib/jsonld";
import { normalizePhone } from "@/lib/phone";
import { toQuoteCategoryOptions } from "@/lib/quote-options";
import { getSiteUrl } from "@/lib/site-url";
import { getMenuCategories } from "@/server/queries/categories";
import { getActiveBanner, getSiteSettings } from "@/server/queries/site";
import { getTurnstileSiteKey } from "@/server/turnstile";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { brandName } = await getSiteSettings();
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: brandName, template: `%s | ${brandName}` },
    openGraph: { siteName: brandName, locale: "vi_VN", type: "website" },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, banner, categories] = await Promise.all([
    getSiteSettings(),
    getActiveBanner(),
    getMenuCategories(),
  ]);
  const sameAs = Object.values(settings.social).filter((url): url is string => Boolean(url));

  return (
    <>
      <a
        href="#noi-dung"
        className="sr-only z-50 rounded-md bg-white px-4 py-3 font-semibold focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Bỏ qua menu, đến nội dung chính
      </a>
      <TopBar settings={settings} />
      <PromoBanner banner={banner} hotline={settings.hotline} />
      <SiteHeader settings={settings} categories={categories} />
      <div id="noi-dung" className="min-h-[50vh]">
        {children}
      </div>
      <SiteFooter settings={settings} />
      {/* Reserve space so the mobile bottom bar never covers the footer. */}
      <div aria-hidden className="h-16 md:hidden" />
      <FloatingContact
        hotline={settings.hotline}
        zalo={settings.zalo}
        tiktok={settings.social.tiktok}
      />
      <StickyBottomBar hotline={settings.hotline} zalo={settings.zalo} />
      <QuoteDialog
        categories={toQuoteCategoryOptions(categories)}
        turnstileSiteKey={getTurnstileSiteKey()}
      />
      <JsonLd
        data={localBusinessJsonLd({
          name: settings.brandName,
          telephone: settings.hotline ? `+84${normalizePhone(settings.hotline).slice(1)}` : null,
          email: settings.email,
          address: settings.address,
          openingHours: settings.workingHours,
          sameAs,
        })}
      />
    </>
  );
}
