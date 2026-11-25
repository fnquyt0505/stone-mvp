import { afterEach, describe, expect, it, vi } from "vitest";
import { imageRecordSchema, validateImageFile } from "@/schemas/image";
import { isLocalStorageAllowed, signCloudinaryParams } from "@/server/storage";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("signCloudinaryParams", () => {
  it("matches Cloudinary's documented example", () => {
    // https://cloudinary.com/documentation/authentication_signatures
    const signature = signCloudinaryParams(
      {
        eager: "w_400,h_300,c_pad|w_260,h_200,c_crop",
        public_id: "sample_image",
        timestamp: 1315060510,
      },
      "abcd",
    );
    expect(signature).toBe("bfd09f95f331f558cbd1320e67aa8d488770583e");
  });
});

describe("validateImageFile", () => {
  it("accepts common image types up to 10 MB", () => {
    expect(validateImageFile({ type: "image/jpeg", size: 1000 })).toBeNull();
    expect(validateImageFile({ type: "image/webp", size: 10 * 1024 * 1024 })).toBeNull();
  });
  it("rejects other types and big files", () => {
    expect(validateImageFile({ type: "image/svg+xml", size: 10 })).toMatch(/Chỉ nhận ảnh/);
    expect(validateImageFile({ type: "image/png", size: 10 * 1024 * 1024 + 1 })).toMatch(/10 MB/);
  });
});

describe("imageRecordSchema", () => {
  const base = { publicId: "stone-mvp/a", width: 800, height: 600 };
  it("requires a meaningful alt text", () => {
    const r = imageRecordSchema.safeParse({
      ...base,
      url: "https://res.cloudinary.com/x/a.jpg",
      alt: " a ",
    });
    expect(r.success).toBe(false);
  });
  it("only accepts Cloudinary or local upload URLs", () => {
    const ok = (url: string) =>
      imageRecordSchema.safeParse({ ...base, url, alt: "Mộ đá đôi" }).success;
    expect(ok("https://res.cloudinary.com/demo/image/upload/v1/stone-mvp/a.jpg")).toBe(true);
    expect(ok("/uploads/2026/11/abc.png")).toBe(true);
    expect(ok("https://evil.example/a.jpg")).toBe(false);
    expect(ok("/uploads/../../etc/passwd")).toBe(false);
    expect(ok("javascript:alert(1)")).toBe(false);
  });
});

describe("isLocalStorageAllowed", () => {
  it("is off when Cloudinary is configured or on Vercel", () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "c");
    vi.stubEnv("CLOUDINARY_API_KEY", "k");
    vi.stubEnv("CLOUDINARY_API_SECRET", "s");
    expect(isLocalStorageAllowed()).toBe(false);
    vi.unstubAllEnvs();
    vi.stubEnv("VERCEL", "1");
    expect(isLocalStorageAllowed()).toBe(false);
  });
  it("is off in production unless explicitly allowed for e2e", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isLocalStorageAllowed()).toBe(false);
    vi.stubEnv("ALLOW_LOCAL_UPLOADS", "1");
    expect(isLocalStorageAllowed()).toBe(true);
  });
});
