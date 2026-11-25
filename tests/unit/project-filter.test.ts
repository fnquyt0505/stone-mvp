import { describe, expect, it } from "vitest";
import { parseProjectFilter, projectListHref, totalPages } from "@/schemas/project-filter";

describe("parseProjectFilter", () => {
  it("reads province, type and page", () => {
    expect(parseProjectFilter({ tinh: "ninh-binh", loai: "lang-mo-da", trang: "2" })).toEqual({
      tinh: "ninh-binh",
      loai: "lang-mo-da",
      trang: 2,
    });
  });

  it("ignores invalid values instead of failing", () => {
    expect(parseProjectFilter({ tinh: "<script>", loai: "Lăng Mộ", trang: "-3" })).toEqual({
      tinh: undefined,
      loai: undefined,
      trang: 1,
    });
    expect(parseProjectFilter({ trang: "abc" }).trang).toBe(1);
    expect(parseProjectFilter({}).trang).toBe(1);
  });

  it("takes the first value of repeated params and treats empty as unset", () => {
    expect(parseProjectFilter({ tinh: ["ha-noi", "hai-phong"], loai: "" })).toMatchObject({
      tinh: "ha-noi",
      loai: undefined,
    });
  });
});

describe("projectListHref", () => {
  it("drops defaults for clean URLs", () => {
    expect(projectListHref({ trang: 1 })).toBe("/cong-trinh/");
    expect(projectListHref({ tinh: "ha-noi", trang: 3 })).toBe("/cong-trinh/?tinh=ha-noi&trang=3");
  });
});

describe("totalPages", () => {
  it("is at least 1 and rounds up", () => {
    expect(totalPages(0)).toBe(1);
    expect(totalPages(9)).toBe(1);
    expect(totalPages(10)).toBe(2);
  });
});
