import { describe, expect, it } from "vitest";
import { navForRole } from "@/components/admin/admin-nav";
import { startOfVnDay, vnDaysAgo } from "@/lib/vn-time";

describe("Vietnam day boundaries (UTC+7)", () => {
  it("uses the Vietnam date, not the UTC date", () => {
    // 2026-11-25 18:30 UTC is already 2026-11-26 01:30 in Vietnam.
    expect(startOfVnDay(new Date("2026-11-25T18:30:00Z")).toISOString()).toBe(
      "2026-11-25T17:00:00.000Z",
    );
    // 2026-11-26 16:59 UTC is still 23:59 on the 26th in Vietnam.
    expect(startOfVnDay(new Date("2026-11-26T16:59:00Z")).toISOString()).toBe(
      "2026-11-25T17:00:00.000Z",
    );
  });

  it("goes back whole Vietnam days", () => {
    expect(vnDaysAgo(6, new Date("2026-11-26T03:00:00Z")).toISOString()).toBe(
      "2026-11-19T17:00:00.000Z",
    );
  });
});

describe("admin navigation", () => {
  it("shows settings to admins only", () => {
    const admin = navForRole("ADMIN").map((i) => i.href);
    const editor = navForRole("EDITOR").map((i) => i.href);
    expect(admin).toContain("/admin/settings/");
    expect(editor).not.toContain("/admin/settings/");
    expect(editor).toContain("/admin/leads/");
  });
});
