import { describe, expect, it } from "vitest";
import {
  bannerInputSchema,
  extractMapEmbedUrl,
  settingsInputSchema,
  settingsToRows,
  testimonialInputSchema,
} from "@/schemas/admin-misc";

describe("testimonialInputSchema", () => {
  const base = {
    id: "",
    name: "Bác Hùng",
    province: "Ninh Bình",
    content: "Làm đẹp, đúng hẹn, giá hợp lý.",
    rating: "",
    order: "0",
    isPublished: true,
  };
  it("accepts an optional 1–5 rating and known provinces", () => {
    expect(testimonialInputSchema.parse({ ...base, rating: "5" })).toMatchObject({
      rating: 5,
      province: "Ninh Bình",
    });
    expect(testimonialInputSchema.parse(base).rating).toBeNull();
    expect(testimonialInputSchema.parse({ ...base, province: "Sao Hỏa" }).province).toBeNull();
    expect(testimonialInputSchema.safeParse({ ...base, rating: "6" }).success).toBe(false);
  });
});

describe("bannerInputSchema", () => {
  const base = {
    id: "",
    title: "Ưu đãi tháng 12",
    subtitle: "",
    ctaLabel: "Gọi ngay",
    ctaHref: "tel:0912345678",
    order: "0",
    isActive: true,
  };
  it.each(["tel:0912345678", "tel:+84912345678", "/lien-he/", "https://zalo.me/0912345678"])(
    "accepts %s",
    (ctaHref) => {
      expect(bannerInputSchema.safeParse({ ...base, ctaHref }).success).toBe(true);
    },
  );
  it.each(["javascript:alert(1)", "//evil.example", "http://insecure.example", "data:text/html,x"])(
    "rejects %s",
    (ctaHref) => {
      expect(bannerInputSchema.safeParse({ ...base, ctaHref }).success).toBe(false);
    },
  );
  it("requires a link when the button has a label", () => {
    expect(bannerInputSchema.safeParse({ ...base, ctaHref: "" }).success).toBe(false);
    expect(bannerInputSchema.safeParse({ ...base, ctaLabel: "", ctaHref: "" }).success).toBe(true);
  });
});

describe("settings", () => {
  const base = {
    brandName: "Xưởng đá An Phú",
    hotline: "0912 345 678",
    zalo: "",
    email: "",
    address: "",
    workingHours: "7:00 – 21:00",
    mapEmbedUrl: "",
    facebook: "",
    tiktok: "",
    youtube: "",
    achievements: "[]",
    authorName: "",
    authorRole: "",
    authorBio: "",
    isSampleData: false,
  };

  it("extracts the embed URL from a pasted Google Maps iframe", () => {
    const iframe =
      '<iframe src="https://www.google.com/maps/embed?pb=!1m18&amp;x=1" width="600" height="450"></iframe>';
    expect(extractMapEmbedUrl(iframe)).toBe("https://www.google.com/maps/embed?pb=!1m18&x=1");
    expect(settingsInputSchema.parse({ ...base, mapEmbedUrl: iframe }).mapEmbedUrl).toBe(
      "https://www.google.com/maps/embed?pb=!1m18&x=1",
    );
    expect(
      settingsInputSchema.safeParse({ ...base, mapEmbedUrl: "https://evil.example/map" }).success,
    ).toBe(false);
  });

  it("normalizes phones and validates links", () => {
    const v = settingsInputSchema.parse({ ...base, zalo: "+84 987 654 321" });
    expect(v).toMatchObject({ hotline: "0912345678", zalo: "0987654321" });
    expect(settingsInputSchema.safeParse({ ...base, hotline: "123" }).success).toBe(false);
    expect(settingsInputSchema.safeParse({ ...base, facebook: "facebook.com/x" }).success).toBe(
      false,
    );
  });

  it("maps the form to setting rows and hides an empty author", () => {
    const rows = settingsToRows(
      settingsInputSchema.parse({ ...base, facebook: "https://facebook.com/x" }),
    );
    expect(rows).toMatchObject({
      brandName: "Xưởng đá An Phú",
      social: { facebook: "https://facebook.com/x", tiktok: "", youtube: "" },
      author: null,
      isSampleData: false,
    });
  });
});
