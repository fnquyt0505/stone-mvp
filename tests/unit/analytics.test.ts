import { afterEach, describe, expect, it, vi } from "vitest";
import { trackContactClick, trackEvent } from "@/lib/analytics";
import { zaloHref } from "@/lib/phone";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("zaloHref", () => {
  it("builds a zalo.me link from any phone format", () => {
    expect(zaloHref("0912 345 678")).toBe("https://zalo.me/0912345678");
    expect(zaloHref("+84912345678")).toBe("https://zalo.me/0912345678");
  });
});

describe("trackEvent", () => {
  it("is a no-op without window or gtag", () => {
    expect(() => trackEvent("x")).not.toThrow();
    vi.stubGlobal("window", {});
    expect(() => trackEvent("x")).not.toThrow();
  });

  it("forwards contact clicks to gtag", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag, location: { pathname: "/mo-da-doi/" } });
    trackContactClick("zalo", "bottom_bar");
    expect(gtag).toHaveBeenCalledWith("event", "contact_click", {
      channel: "zalo",
      placement: "bottom_bar",
      page_path: "/mo-da-doi/",
    });
  });

  it("swallows gtag errors", () => {
    vi.stubGlobal("window", {
      gtag: () => {
        throw new Error("blocked");
      },
      location: { pathname: "/" },
    });
    expect(() => trackContactClick("call", "floating")).not.toThrow();
  });
});
