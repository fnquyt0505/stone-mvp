import type { Metadata } from "next";
import { SavedNotice } from "@/components/admin/use-admin-form";
import { parseSiteSettings } from "@/schemas/site-settings";
import { requireAdmin } from "@/server/auth-guard";
import { db } from "@/server/db";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Cài đặt" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Admin-only. Reads the table directly (not the site cache) so values are always current. */
export default async function AdminSettingsPage({ searchParams }: Props) {
  await requireAdmin();
  const settings = parseSiteSettings(
    await db.siteSetting.findMany({ select: { key: true, value: true } }),
  );
  const saved = (await searchParams)["da-luu"] === "1";
  return (
    <main className="grid gap-6">
      <h1>Cài đặt website</h1>
      {saved ? <SavedNotice text="Đã lưu cài đặt. Website đã được cập nhật." /> : null}
      <SettingsForm settings={settings} />
    </main>
  );
}
