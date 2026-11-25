import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "@/lib/csv";
import { vnDateEnd, vnDateStart } from "@/lib/vn-time";
import { leadFilterQuery, leadUpdateSchema, parseLeadFilter } from "@/schemas/admin-lead";

describe("csv", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(csvCell('Mộ "đôi", 3 × 4\nm')).toBe('"Mộ ""đôi"", 3 × 4\nm"');
    expect(csvCell(null)).toBe("");
  });
  it("neutralizes spreadsheet formulas", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("+84912")).toBe("'+84912");
    expect(csvCell("@cmd")).toBe("'@cmd");
  });
  it("adds a UTF-8 BOM and CRLF line endings", () => {
    expect(toCsv(["a", "b"], [[1, "x"]])).toBe("﻿a,b\r\n1,x\r\n");
  });
});

describe("lead filters", () => {
  it("parses Vietnamese query keys and ignores junk", () => {
    expect(
      parseLeadFilter({ "trang-thai": "NEW", "tu-ngay": "2026-11-01", q: " An ", trang: "2" }),
    ).toEqual({ status: "NEW", from: "2026-11-01", to: undefined, q: "An", page: 2 });
    expect(parseLeadFilter({ "trang-thai": "DROP", "tu-ngay": "hôm qua", trang: "x" })).toEqual({
      status: undefined,
      from: undefined,
      to: undefined,
      q: undefined,
      page: 1,
    });
  });
  it("builds query strings without defaults", () => {
    expect(leadFilterQuery({ status: "WON", page: 1 })).toBe("?trang-thai=WON");
    expect(leadFilterQuery({})).toBe("");
  });
  it("uses Vietnam day boundaries for date ranges", () => {
    expect(vnDateStart("2026-11-26")?.toISOString()).toBe("2026-11-25T17:00:00.000Z");
    expect(vnDateEnd("2026-11-26")?.toISOString()).toBe("2026-11-26T17:00:00.000Z");
    expect(vnDateStart("26/11/2026")).toBeNull();
  });
});

describe("leadUpdateSchema", () => {
  it("accepts a valid update and empties blank notes", () => {
    expect(
      leadUpdateSchema.parse({ id: "clx0000000000000000000000", status: "QUOTED", note: "  " }),
    ).toEqual({ id: "clx0000000000000000000000", status: "QUOTED", note: null });
  });
  it("rejects unknown statuses", () => {
    expect(
      leadUpdateSchema.safeParse({ id: "clx0000000000000000000000", status: "DONE" }).success,
    ).toBe(false);
  });
});
