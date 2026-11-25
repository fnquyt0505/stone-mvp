"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import Script from "next/script";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = { reset: () => void };

/**
 * Cloudflare Turnstile rendered explicitly so it also works after client-side
 * navigation. It injects the hidden `cf-turnstile-response` input into the form.
 */
export const TurnstileWidget = forwardRef<TurnstileHandle, { siteKey: string }>(
  function TurnstileWidget({ siteKey }, ref) {
    const container = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);

    const render = useCallback(() => {
      if (!window.turnstile || !container.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(container.current, {
        sitekey: siteKey,
        language: "vi",
        appearance: "interaction-only",
      });
    }, [siteKey]);

    useEffect(() => {
      render();
      return () => {
        if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      };
    }, [render]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetId.current) window.turnstile?.reset(widgetId.current);
      },
    }));

    return (
      <>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={render}
          onReady={render}
        />
        <div ref={container} />
      </>
    );
  },
);
