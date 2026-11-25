import type { Metadata } from "next";
import { ComingSoon } from "@/components/admin/coming-soon";
import { requireAdmin } from "@/server/auth-guard";

export const metadata: Metadata = { title: "Cài đặt" };

export default async function Page() {
  await requireAdmin();
  return <ComingSoon title="Cài đặt" task="T25" />;
}
