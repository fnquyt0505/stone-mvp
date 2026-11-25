import { describe, expect, it } from "vitest";
import { PROVINCES } from "@/lib/provinces";
import { leadInputSchema, parseUtm } from "@/schemas/lead";

const valid = { name: "Nguyễn Văn A", phone: "0912 345 678" };

describe("leadInputSchema", () => {
  it("accepts a minimal valid request and normalizes the phone", () => {
    const r = leadInputSchema.parse(valid);
    expect(r).toMatchObject({ name: "Nguyễn Văn A", phone: "0912345678", sourceUrl: "/" });
  });

  it.each(["+84 912 345 678", "84912345678", "0912.345.678", "02438123456"])(
    "accepts phone %s",
    (phone) => {
      expect(leadInputSchema.safeParse({ ...valid, phone }).success).toBe(true);
    },
  );

  it.each(["", "12345", "0112345678", "091234567", "09123456789", "abc"])(
    "rejects phone %s with a Vietnamese message",
    (phone) => {
      const r = leadInputSchema.safeParse({ ...valid, phone });
      expect(r.success).toBe(false);
      if (!r.success) expect(r.error.issues[0]?.message).toMatch(/Số điện thoại/);
    },
  );

  it("requires a name", () => {
    const r = leadInputSchema.safeParse({ ...valid, name: " " });
    expect(r.success).toBe(false);
  });

  it("keeps only known provinces and valid-looking category ids", () => {
    const r = leadInputSchema.parse({
      ...valid,
      province: "Tỉnh Không Tồn Tại",
      categoryId: "drop table",
    });
    expect(r.province).toBeUndefined();
    expect(r.categoryId).toBeUndefined();
    expect(leadInputSchema.parse({ ...valid, province: "Ninh Bình" }).province).toBe("Ninh Bình");
  });

  it("only stores same-site paths as sourceUrl", () => {
    expect(leadInputSchema.parse({ ...valid, sourceUrl: "/mo-da-doi/?a=1" }).sourceUrl).toBe(
      "/mo-da-doi/?a=1",
    );
    expect(leadInputSchema.parse({ ...valid, sourceUrl: "https://evil.example" }).sourceUrl).toBe(
      "/",
    );
    expect(leadInputSchema.parse({ ...valid, sourceUrl: "//evil.example" }).sourceUrl).toBe("/");
  });

  it("limits message length", () => {
    expect(leadInputSchema.safeParse({ ...valid, message: "x".repeat(1001) }).success).toBe(false);
  });
});

describe("parseUtm", () => {
  it("parses known keys and drops the rest", () => {
    expect(parseUtm('{"source":"facebook","foo":"bar"}')).toEqual({ source: "facebook" });
  });
  it("ignores malformed input", () => {
    expect(parseUtm("not json")).toBeUndefined();
    expect(parseUtm('{"source":123}')).toBeUndefined();
    expect(parseUtm("{}")).toBeUndefined();
    expect(parseUtm(null)).toBeUndefined();
  });
});

describe("PROVINCES", () => {
  it("has the 34 post-2025 provincial units without duplicates", () => {
    expect(PROVINCES).toHaveLength(34);
    expect(new Set(PROVINCES).size).toBe(34);
  });
});
