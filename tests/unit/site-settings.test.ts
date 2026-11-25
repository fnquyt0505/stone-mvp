import { describe, expect, it } from "vitest";
import { formatPhone, normalizePhone, telHref } from "@/lib/phone";
import { parseSiteSettings } from "@/schemas/site-settings";

describe("phone helpers", () => {
  it("normalizes Vietnamese numbers", () => {
    expect(normalizePhone("+84 912 345 678")).toBe("0912345678");
    expect(normalizePhone("0912.345.678")).toBe("0912345678");
  });
  it("formats mobile and landline numbers", () => {
    expect(formatPhone("0912345678")).toBe("0912 345 678");
    expect(formatPhone("02438123456")).toBe("024 3812 3456");
  });
  it("builds international tel: links", () => {
    expect(telHref("0912 345 678")).toBe("tel:+84912345678");
  });
});

describe("parseSiteSettings", () => {
  it("merges key/value rows", () => {
    const s = parseSiteSettings([
      { key: "brandName", value: "Xưởng A" },
      { key: "hotline", value: "0900000000" },
      { key: "social", value: { facebook: "https://facebook.com/a", tiktok: "" } },
    ]);
    expect(s.brandName).toBe("Xưởng A");
    expect(s.hotline).toBe("0900000000");
    expect(s.social).toEqual({ facebook: "https://facebook.com/a" });
  });

  it("falls back to defaults for missing or invalid values", () => {
    const s = parseSiteSettings([
      { key: "brandName", value: 42 },
      { key: "email", value: "not-an-email" },
      { key: "unknownKey", value: "x" },
    ]);
    expect(s.brandName).toBe("Xưởng đá mỹ nghệ");
    expect(s.email).toBeUndefined();
    expect(s.social).toEqual({});
    expect(s.isSampleData).toBe(false);
  });
});
