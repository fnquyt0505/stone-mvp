import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { formatPhone, telHref } from "@/lib/phone";
import type { SiteSettings } from "@/schemas/site-settings";
import { EXPLORE_NAV, POLICY_NAV } from "./nav-links";

const SOCIAL_LABELS = { facebook: "Facebook", tiktok: "TikTok", youtube: "YouTube" } as const;

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-heading text-lg font-semibold text-white md:text-xl">{children}</h2>;
}

/** Dark footer: contact details, quick links, policies, social links. */
export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const { brandName, hotline, email, address, workingHours, social } = settings;
  const socials = (Object.keys(SOCIAL_LABELS) as (keyof typeof SOCIAL_LABELS)[]).flatMap((key) =>
    social[key] ? [{ key, href: social[key], label: SOCIAL_LABELS[key] }] : [],
  );

  return (
    <footer className="bg-stone-900 text-stone-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3 md:px-6 md:py-16">
        <section aria-labelledby="footer-contact" className="space-y-4">
          <FooterHeading>
            <span id="footer-contact">{brandName}</span>
          </FooterHeading>
          <ul className="space-y-3">
            {address ? (
              <li className="flex gap-3">
                <MapPin aria-hidden className="mt-1 size-5 shrink-0 text-gold-600" />
                <span>{address}</span>
              </li>
            ) : null}
            {hotline ? (
              <li className="flex gap-3">
                <Phone aria-hidden className="mt-1 size-5 shrink-0 text-gold-600" />
                <a href={telHref(hotline)} className="font-semibold text-white hover:underline">
                  Hotline: {formatPhone(hotline)}
                </a>
              </li>
            ) : null}
            {email ? (
              <li className="flex gap-3">
                <Mail aria-hidden className="mt-1 size-5 shrink-0 text-gold-600" />
                <a href={`mailto:${email}`} className="hover:underline">
                  {email}
                </a>
              </li>
            ) : null}
            {workingHours ? (
              <li className="flex gap-3">
                <Clock aria-hidden className="mt-1 size-5 shrink-0 text-gold-600" />
                <span>{workingHours}</span>
              </li>
            ) : null}
          </ul>
        </section>

        <nav aria-labelledby="footer-explore" className="space-y-4">
          <FooterHeading>
            <span id="footer-explore">Tìm hiểu thêm</span>
          </FooterHeading>
          <ul className="space-y-2">
            {EXPLORE_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block py-1 hover:text-white hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-policy" className="space-y-4">
          <FooterHeading>
            <span id="footer-policy">Chính sách</span>
          </FooterHeading>
          <ul className="space-y-2">
            {POLICY_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block py-1 hover:text-white hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {socials.length ? (
            <ul className="flex flex-wrap gap-3 pt-2" aria-label="Mạng xã hội">
              {socials.map((s) => (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center rounded-md border border-stone-700 px-4 hover:border-gold-600 hover:text-white"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </nav>
      </div>

      <div className="border-t border-stone-700">
        <p className="mx-auto max-w-7xl px-4 py-4 text-small-responsive md:px-6">
          © {new Date().getFullYear()} {brandName}. Bảo lưu mọi quyền.
        </p>
      </div>
    </footer>
  );
}
