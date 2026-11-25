"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackContactClick } from "@/lib/analytics";
import { QUOTE_HREF } from "./nav-links";
import { useQuoteCategory } from "./quote-context";
import { QuoteForm, type CategoryOptionGroup } from "./quote-form";

/** Anything that should open the popup: the quote link or an explicit marker. */
const TRIGGER_SELECTOR = `a[href="${QUOTE_HREF}"], [data-open-quote]`;

/**
 * Site-wide quote popup. Intercepts clicks on any "Báo giá" link so visitors
 * stay on the page they are viewing; without JavaScript those links still go
 * to the form on the contact page.
 */
export function QuoteDialog({
  categories,
  turnstileSiteKey,
}: {
  categories: CategoryOptionGroup[];
  turnstileSiteKey: string | null;
}) {
  const [open, setOpen] = useState(false);
  // Bumped on each open so the form starts fresh with the current category.
  const [session, setSession] = useState(0);
  const categoryId = useQuoteCategory();

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const trigger = (event.target as Element | null)?.closest(TRIGGER_SELECTOR);
      if (!trigger) return;
      event.preventDefault();
      // Links that already track their own click (bottom bar) mark themselves.
      if (!trigger.hasAttribute("data-tracked")) trackContactClick("quote", "page");
      setSession((s) => s + 1);
      setOpen(true);
    }
    // Capture phase: run before next/link's own handler, which then sees
    // defaultPrevented and skips client-side navigation.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto p-5 sm:p-8">
        <DialogHeader className="text-left">
          <DialogTitle className="pr-10 font-heading text-2xl leading-snug">
            Nhận báo giá miễn phí
          </DialogTitle>
          <DialogDescription className="text-base text-stone-700">
            Để lại thông tin, chúng tôi sẽ gọi lại tư vấn mẫu và báo giá trọn gói.
          </DialogDescription>
        </DialogHeader>
        <QuoteForm
          key={session}
          categories={categories}
          defaultCategoryId={categoryId ?? undefined}
          turnstileSiteKey={turnstileSiteKey}
          idPrefix="popup-quote"
        />
      </DialogContent>
    </Dialog>
  );
}
