import { Clock, Mail, Phone } from "lucide-react";
import { formatPhone, telHref } from "@/lib/phone";
import type { SiteSettings } from "@/schemas/site-settings";

/** Thin dark strip: working hours, hotline, email. */
export function TopBar({ settings }: { settings: SiteSettings }) {
  const { workingHours, hotline, email } = settings;
  if (!workingHours && !hotline && !email) return null;

  return (
    <div className="bg-stone-900 text-small-responsive text-stone-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 md:px-6">
        {workingHours ? (
          <p className="flex items-center gap-2">
            <Clock aria-hidden className="size-4 shrink-0" />
            <span className="sr-only">Giờ làm việc:</span>
            {workingHours}
          </p>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-5">
          {email ? (
            <a
              href={`mailto:${email}`}
              className="hidden items-center gap-2 hover:text-white md:flex"
            >
              <Mail aria-hidden className="size-4" />
              {email}
            </a>
          ) : null}
          {hotline ? (
            <a
              href={telHref(hotline)}
              className="flex shrink-0 items-center gap-2 font-semibold whitespace-nowrap text-white hover:text-gold-600"
            >
              <Phone aria-hidden className="size-4" />
              <span className="sr-only">Hotline:</span>
              {formatPhone(hotline)}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
