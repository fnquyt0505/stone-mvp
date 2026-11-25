import { describe, expect, it } from "vitest";
import { pageCount, parsePageParam } from "@/lib/pagination";

describe("parsePageParam", () => {
  it.each([
    [undefined, 1],
    ["2", 2],
    [["3", "4"], 3],
    ["0", 1],
    ["-2", 1],
    ["1.5", 1],
    ["abc", 1],
    ["1001", 1],
  ] as const)("%s -> %i", (input, expected) => {
    expect(parsePageParam(input as string | string[] | undefined)).toBe(expected);
  });
});

describe("pageCount", () => {
  it("is at least one page and rounds up", () => {
    expect(pageCount(0, 9)).toBe(1);
    expect(pageCount(9, 9)).toBe(1);
    expect(pageCount(10, 9)).toBe(2);
  });
});
